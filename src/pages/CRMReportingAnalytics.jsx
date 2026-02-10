import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, TrendingUp, Users, BookOpen, Award, Calendar, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function CRMReportingAnalytics() {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filters, setFilters] = useState({});
  const [predictions, setPredictions] = useState(null);

  // Generate report
  const generateReport = useMutation({
    mutationFn: async (reportType) => {
      const { data } = await base44.functions.invoke('generateAnalyticsReport', {
        report_type: reportType,
        filters,
        date_range: { start: null, end: null }
      });
      return data;
    },
    onSuccess: (data) => {
      setSelectedReport(data);
      toast.success('Report generated successfully');
    }
  });

  // Get predictions
  const getPredictions = useMutation({
    mutationFn: async (predictionType) => {
      const { data } = await base44.functions.invoke('predictiveAnalytics', {
        prediction_type: predictionType
      });
      return data;
    },
    onSuccess: (data) => {
      setPredictions(data);
      toast.success('Predictions generated');
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <BarChart className="w-8 h-8 text-blue-600" />
              Reporting & Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              AI-powered insights and predictive analytics
            </p>
          </div>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="predictions">Predictive Analytics</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Report Generator Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                    onClick={() => generateReport.mutate('student_cohort')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-blue-600" />
                    Student Cohort
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Analyze student demographics, preferences, and patterns</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => generateReport.mutate('application_trends')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Application Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Track application patterns, success rates, and bottlenecks</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => generateReport.mutate('counselor_performance')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="w-5 h-5 text-purple-600" />
                    Counselor Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Evaluate counselor effectiveness and workload</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => generateReport.mutate('course_effectiveness')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Course Catalog
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Assess catalog performance and engagement</p>
                </CardContent>
              </Card>
            </div>

            {/* Report Display */}
            {generateReport.isPending && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-pulse" />
                  <p className="text-slate-600">Generating AI-powered report...</p>
                </CardContent>
              </Card>
            )}

            {selectedReport && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      {selectedReport.report_type.replace('_', ' ').toUpperCase()} Report
                    </CardTitle>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">Generated: {new Date(selectedReport.generated_at).toLocaleString()}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Student Cohort Report */}
                  {selectedReport.report_type === 'student_cohort' && selectedReport.data && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Cohort Size</h4>
                        <p className="text-3xl font-bold text-blue-600">{selectedReport.data.cohort_size}</p>
                      </div>

                      {selectedReport.data.demographics && (
                        <div>
                          <h4 className="font-semibold mb-3">Demographics</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-slate-600 mb-2">Top Countries</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.data.demographics.top_countries?.map((country, i) => (
                                  <Badge key={i}>{country}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                              <p className="text-sm font-medium text-slate-600 mb-2">Popular Programs</p>
                              <div className="flex flex-wrap gap-2">
                                {selectedReport.data.demographics.popular_programs?.map((prog, i) => (
                                  <Badge key={i} variant="outline">{prog}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedReport.data.trends?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Key Trends</h4>
                          <ul className="space-y-2">
                            {selectedReport.data.trends.map((trend, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{trend}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedReport.data.recommendations?.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {selectedReport.data.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-green-800">→ {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* Application Trends Report */}
                  {selectedReport.report_type === 'application_trends' && selectedReport.data && (
                    <>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-green-700 mb-1">Total Applications</p>
                          <p className="text-3xl font-bold text-green-600">{selectedReport.data.total_applications}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-700 mb-1">Success Rate</p>
                          <p className="text-3xl font-bold text-blue-600">{selectedReport.data.success_rate}%</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-700 mb-1">Enrolled</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {selectedReport.data.conversion_funnel?.enrolled || 0}
                          </p>
                        </div>
                      </div>

                      {selectedReport.data.bottlenecks?.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-3">Identified Bottlenecks</h4>
                          <ul className="space-y-2">
                            {selectedReport.data.bottlenecks.map((bottleneck, i) => (
                              <li key={i} className="text-sm text-orange-800">⚠️ {bottleneck}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* Counselor Performance Report */}
                  {selectedReport.report_type === 'counselor_performance' && selectedReport.data && (
                    <>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-700 mb-1">Total Counselors</p>
                          <p className="text-3xl font-bold text-purple-600">{selectedReport.data.total_counselors}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-indigo-700 mb-1">Avg Success Rate</p>
                          <p className="text-3xl font-bold text-indigo-600">
                            {selectedReport.data.team_performance?.avg_success_rate}%
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">Counselor Metrics</h4>
                        <div className="space-y-2">
                          {selectedReport.data.metrics?.slice(0, 5).map((metric, i) => (
                            <div key={i} className="bg-white border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-semibold">{metric.name}</h5>
                                <Badge>{metric.success_rate}% success</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <span className="text-slate-600">Students: </span>
                                  <strong>{metric.students}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-600">Applications: </span>
                                  <strong>{metric.applications}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-600">Communications: </span>
                                  <strong>{metric.communications}</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Course Effectiveness Report */}
                  {selectedReport.report_type === 'course_effectiveness' && selectedReport.data && (
                    <>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-orange-900 mb-2">Catalog Size</h4>
                        <p className="text-3xl font-bold text-orange-600">{selectedReport.data.catalog_size} courses</p>
                      </div>

                      {selectedReport.data.engagement_metrics && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-blue-700 mb-1">View Rate</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {selectedReport.data.engagement_metrics.view_rate}%
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-green-700 mb-1">Application Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {selectedReport.data.engagement_metrics.application_rate}%
                            </p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-purple-700 mb-1">Conversion Rate</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {selectedReport.data.engagement_metrics.conversion_rate}%
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedReport.data.recommendations?.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-indigo-900 mb-3">Optimization Recommendations</h4>
                          <ul className="space-y-2">
                            {selectedReport.data.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-indigo-800">→ {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Predictive Analytics Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => getPredictions.mutate('success_rates')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Student Success Prediction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Predict future student success rates and identify risk factors</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => getPredictions.mutate('enrollment_forecast')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Enrollment Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">Forecast future enrollment trends and capacity needs</p>
                </CardContent>
              </Card>
            </div>

            {getPredictions.isPending && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-green-600 animate-pulse" />
                  <p className="text-slate-600">Generating predictions...</p>
                </CardContent>
              </Card>
            )}

            {predictions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Predictive Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {predictions.prediction_type === 'success_rates' && predictions.predictions && (
                    <>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2">Predicted Success Rate</h4>
                        <p className="text-4xl font-bold text-green-600">
                          {predictions.predictions.predicted_success_rate}%
                        </p>
                        <Badge className="mt-2">{predictions.predictions.trend_direction}</Badge>
                      </div>

                      {predictions.predictions.success_drivers?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3">Success Drivers</h4>
                          <ul className="space-y-2">
                            {predictions.predictions.success_drivers.map((driver, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span className="text-sm">{driver}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {predictions.predictions.recommendations?.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3">Recommendations</h4>
                          <ul className="space-y-2">
                            {predictions.predictions.recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-blue-800">→ {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {predictions.prediction_type === 'enrollment_forecast' && predictions.predictions && (
                    <>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-4">Next Quarter Forecast</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-blue-700 mb-1">Month 1</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {predictions.predictions.next_quarter_forecast?.month_1}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-700 mb-1">Month 2</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {predictions.predictions.next_quarter_forecast?.month_2}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-blue-700 mb-1">Month 3</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {predictions.predictions.next_quarter_forecast?.month_3}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-3 text-center">
                          Confidence: {predictions.predictions.next_quarter_forecast?.confidence_level}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-green-700 mb-1">Growth Rate</p>
                          <p className="text-2xl font-bold text-green-600">
                            {predictions.predictions.growth_rate}%
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-purple-700 mb-1">Pipeline Health</p>
                          <p className="text-lg font-semibold text-purple-600">
                            {predictions.predictions.pipeline_health}
                          </p>
                        </div>
                      </div>

                      {predictions.predictions.capacity_recommendations?.length > 0 && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-3">Capacity Planning</h4>
                          <ul className="space-y-2">
                            {predictions.predictions.capacity_recommendations.map((rec, i) => (
                              <li key={i} className="text-sm text-orange-800">→ {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}