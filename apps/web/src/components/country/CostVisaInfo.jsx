import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Briefcase, FileText, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CostVisaInfo({ 
  tuitionFees = {},
  livingCost = '',
  workRights = '',
  postStudyWork = '',
  visaProcessingTime = '',
  additionalInfo = []
}) {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-3">
            Cost, Visa & Work Opportunities
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about finances and work rights
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Tuition Fees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-lg h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  Tuition Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tuitionFees.undergraduate && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Undergraduate</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {tuitionFees.undergraduate}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">per year</p>
                  </div>
                )}
                {tuitionFees.postgraduate && (
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-purple-900 mb-2">Postgraduate</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {tuitionFees.postgraduate}
                    </p>
                    <p className="text-sm text-purple-700 mt-1">per year</p>
                  </div>
                )}
                {tuitionFees.note && (
                  <p className="text-sm text-slate-600">{tuitionFees.note}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Living Cost */}
          {livingCost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                    Living Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-emerald-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-600 mb-2">
                      {livingCost}
                    </p>
                    <p className="text-sm text-emerald-700">
                      Estimated annual living expenses
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Work Rights */}
          {workRights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-amber-600" />
                    Work Rights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-amber-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-amber-600 mb-2">
                      {workRights}
                    </p>
                    <p className="text-sm text-amber-700">
                      Part-time work during studies
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Post-Study Work */}
          {postStudyWork && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-purple-600" />
                    Post-Study Work
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <p className="text-2xl font-bold text-purple-600 mb-2">
                      {postStudyWork}
                    </p>
                    <p className="text-sm text-purple-700">
                      Work visa after graduation
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Additional Info */}
        {additionalInfo.length > 0 && (
          <div className="mt-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Additional Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {additionalInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Badge className="mt-0.5 bg-blue-600">{index + 1}</Badge>
                      <p className="text-slate-700">{info}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}