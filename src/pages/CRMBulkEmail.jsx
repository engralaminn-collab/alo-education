import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CRMLayout from '@/components/crm/CRMLayout';
import BulkEmailTool from '@/components/crm/BulkEmailTool';

export default function CRMBulkEmail() {
  const { data: students = [] } = useQuery({
    queryKey: ['students-for-bulk-email'],
    queryFn: () => base44.entities.StudentProfile.list('-created_date', 500),
  });

  return (
    <CRMLayout title="Bulk Email Campaign">
      <div className="max-w-4xl">
        <BulkEmailTool students={students} />
      </div>
    </CRMLayout>
  );
}