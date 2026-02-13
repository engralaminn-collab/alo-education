import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const { file_url } = await req.json();

        if (!file_url) {
            return Response.json({ error: 'file_url is required' }, { status: 400 });
        }

        // Define the schema for extracting student data
        const schema = {
            type: "object",
            properties: {
                students: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            first_name: { type: "string" },
                            last_name: { type: "string" },
                            email: { type: "string" },
                            alternative_email: { type: "string" },
                            phone: { type: "string" },
                            alternative_phone: { type: "string" },
                            nationality: { type: "string" },
                            date_of_birth: { type: "string" },
                            emergency_contact: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    phone: { type: "string" }
                                }
                            },
                            education_history: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        level: { type: "string" },
                                        institution: { type: "string" },
                                        field_of_study: { type: "string" },
                                        graduation_year: { type: "number" },
                                        gpa: { type: "number" },
                                        gpa_scale: { type: "number" }
                                    }
                                }
                            },
                            passport_details: {
                                type: "object",
                                properties: {
                                    has_passport: { type: "boolean" },
                                    passport_number: { type: "string" },
                                    place_of_issue: { type: "string" },
                                    issue_date: { type: "string" },
                                    expiry_date: { type: "string" }
                                }
                            },
                            english_proficiency: {
                                type: "object",
                                properties: {
                                    has_test: { type: "boolean" },
                                    test_type: { type: "string" },
                                    test_date: { type: "string" },
                                    planned_test_date: { type: "string" },
                                    overall_score: { type: "number" },
                                    listening_score: { type: "number" },
                                    reading_score: { type: "number" },
                                    writing_score: { type: "number" },
                                    speaking_score: { type: "number" }
                                }
                            },
                            work_experience: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        company_name: { type: "string" },
                                        designation: { type: "string" },
                                        start_date: { type: "string" },
                                        end_date: { type: "string" },
                                        currently_working: { type: "boolean" },
                                        responsibilities: { type: "string" }
                                    }
                                }
                            },
                            recommendation_letters: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        designation: { type: "string" },
                                        department: { type: "string" },
                                        organization: { type: "string" },
                                        email: { type: "string" },
                                        phone: { type: "string" }
                                    }
                                }
                            },
                            visa_history: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        country: { type: "string" },
                                        visa_type: { type: "string" },
                                        issue_date: { type: "string" },
                                        expiry_date: { type: "string" },
                                        visa_status: { type: "string" }
                                    }
                                }
                            },
                            preferred_countries: {
                                type: "array",
                                items: { type: "string" }
                            },
                            preferred_degree_level: { type: "string" },
                            preferred_fields: {
                                type: "array",
                                items: { type: "string" }
                            },
                            budget_max: { type: "number" },
                            target_intake: { type: "string" },
                            source: { type: "string" },
                            notes: { type: "string" }
                        }
                    }
                }
            }
        };

        // Extract data from the file
        const extractResult = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: schema
        });

        if (extractResult.status === 'error') {
            return Response.json({
                success: false,
                error: extractResult.details
            }, { status: 400 });
        }

        const studentsData = extractResult.output?.students || [];

        if (studentsData.length === 0) {
            return Response.json({
                success: false,
                error: 'No student data found in the file'
            }, { status: 400 });
        }

        // Bulk create student profiles
        const createdProfiles = [];
        const errors = [];

        for (const student of studentsData) {
            try {
                // Skip if no email
                if (!student.email) {
                    errors.push({ student, error: 'Missing required email field' });
                    continue;
                }

                // Calculate profile completeness
                const totalFields = 15;
                let completedFields = 0;
                if (student.first_name) completedFields++;
                if (student.last_name) completedFields++;
                if (student.email) completedFields++;
                if (student.phone) completedFields++;
                if (student.nationality) completedFields++;
                if (student.date_of_birth) completedFields++;
                if (student.education_history?.length > 0) completedFields++;
                if (student.passport_details?.has_passport) completedFields++;
                if (student.english_proficiency?.has_test) completedFields++;
                if (student.work_experience?.length > 0) completedFields++;
                if (student.preferred_countries?.length > 0) completedFields++;
                if (student.preferred_degree_level) completedFields++;
                if (student.preferred_fields?.length > 0) completedFields++;
                if (student.budget_max) completedFields++;
                if (student.target_intake) completedFields++;

                const profile_completeness = Math.round((completedFields / totalFields) * 100);

                const profileData = {
                    ...student,
                    profile_completeness,
                    status: 'new_lead'
                };

                const created = await base44.asServiceRole.entities.StudentProfile.create(profileData);
                createdProfiles.push(created);
            } catch (error) {
                errors.push({ student, error: error.message });
            }
        }

        return Response.json({
            success: true,
            imported: createdProfiles.length,
            failed: errors.length,
            errors: errors.length > 0 ? errors : undefined,
            profiles: createdProfiles
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});