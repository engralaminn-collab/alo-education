import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  MessageSquare, 
  GraduationCap, 
  FileText, 
  Award, 
  Plane, 
  Users, 
  Home, 
  Briefcase 
} from 'lucide-react';
import { motion } from 'framer-motion';

const services = [
  {
    icon: MessageSquare,
    title: 'Counselling',
    description: 'Expert guidance on course and university selection'
  },
  {
    icon: GraduationCap,
    title: 'University Selection',
    description: 'Find the perfect institution for your goals'
  },
  {
    icon: FileText,
    title: 'Application',
    description: 'Complete application support and document prep'
  },
  {
    icon: Award,
    title: 'Scholarships',
    description: 'Discover and apply for funding opportunities'
  },
  {
    icon: Plane,
    title: 'Visa',
    description: 'End-to-end visa application assistance'
  },
  {
    icon: Users,
    title: 'Interview Prep',
    description: 'Mock interviews and confidence building'
  },
  {
    icon: Home,
    title: 'Accommodation',
    description: 'Help finding safe and comfortable housing'
  },
  {
    icon: Briefcase,
    title: 'Pre-departure',
    description: 'Essential guidance before you travel'
  }
];

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--alo-blue)' }}>
            Our Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Comprehensive support for your study abroad journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full border-2 hover:shadow-xl transition-all duration-300 cursor-pointer hover:border-orange-500">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: 'var(--alo-blue)' }}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--alo-blue)' }}>
                    {service.title}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}