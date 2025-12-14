import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, Send, Sparkles, FileText, HelpCircle, Calendar,
  GraduationCap, Loader2, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Footer from '@/components/landing/Footer';
import ReactMarkdown from 'react-markdown';

const counselorModes = [
  { 
    id: 'recommendations', 
    label: 'College Recommendations', 
    icon: GraduationCap,
    prompt: 'Based on my profile, which universities would be the best fit for me?'
  },
  { 
    id: 'essay', 
    label: 'Essay Guidance', 
    icon: FileText,
    prompt: 'I need help with my application essay. Can you guide me?'
  },
  { 
    id: 'faq', 
    label: 'FAQ & General Help', 
    icon: HelpCircle,
    prompt: 'What are the visa requirements for studying in the UK?'
  },
  { 
    id: 'deadlines', 
    label: 'Deadlines & Advice', 
    icon: Calendar,
    prompt: 'What should I focus on right now based on my application status?'
  },
];

export default function AICounselor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const messagesEndRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studentProfile } = useQuery({
    queryKey: ['student-profile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.StudentProfile.filter({ email: user?.email });
      return profiles[0];
    },
    enabled: !!user?.email,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications', studentProfile?.id],
    queryFn: () => base44.entities.Application.filter({ student_id: studentProfile?.id }),
    enabled: !!studentProfile?.id,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-ai'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: universities = [] } = useQuery({
    queryKey: ['universities-ai'],
    queryFn: () => base44.entities.University.list(),
  });

  const aiMutation = useMutation({
    mutationFn: async (userMessage) => {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const systemContext = buildSystemContext(selectedMode, studentProfile, applications, courses, universities);
      
      const fullPrompt = `${systemContext}

Previous conversation:
${conversationHistory.map(m => `${m.role === 'user' ? 'Student' : 'Counselor'}: ${m.content}`).join('\n')}

Student: ${userMessage}
Counselor:`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        add_context_from_internet: selectedMode === 'faq',
      });

      return response;
    },
    onSuccess: (response, userMessage) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      ]);
      setInput('');
    },
    onError: () => {
      toast.error('Failed to get response. Please try again.');
    },
  });

  const handleSend = () => {
    if (input.trim() && !aiMutation.isPending) {
      aiMutation.mutate(input);
    }
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
    setMessages([{
      role: 'assistant',
      content: getWelcomeMessage(mode.id, studentProfile)
    }]);
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  const resetChat = () => {
    setMessages([]);
    setSelectedMode(null);
    setInput('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Bot className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Login Required</h3>
            <p className="text-slate-600">Please log in to access the AI Counselor</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-4 text-white">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">AI College Counselor</h1>
              <p className="text-blue-100">Your personal AI-powered study abroad advisor</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-8">
        {!selectedMode ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  How can I help you today?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {counselorModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <motion.button
                        key={mode.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleModeSelect(mode)}
                        className="p-6 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all"
                      >
                        <Icon className="w-8 h-8 text-blue-600 mb-3" />
                        <h3 className="font-bold text-slate-900 mb-2">{mode.label}</h3>
                        <p className="text-sm text-slate-600 italic">"{mode.prompt}"</p>
                      </motion.button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {studentProfile && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Your Profile Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Education Level</p>
                      <p className="font-semibold">
                        {studentProfile.education_history?.[0]?.academic_level || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Study Preference</p>
                      <p className="font-semibold">
                        {studentProfile.admission_preferences?.study_destination || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Active Applications</p>
                      <p className="font-semibold">{applications.length} applications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>AI Counselor</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {counselorModes.find(m => m.id === selectedMode)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={resetChat}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Messages */}
                <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                            : 'bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm'
                        } p-4`}>
                          {message.role === 'assistant' ? (
                            <ReactMarkdown className="prose prose-sm max-w-none">
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {aiMutation.isPending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 rounded-2xl rounded-bl-sm p-4">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                {messages.length <= 1 && (
                  <div className="px-6 pb-4">
                    <p className="text-xs text-slate-500 mb-2">Quick prompts:</p>
                    <div className="flex flex-wrap gap-2">
                      {getQuickPrompts(selectedMode).map((prompt, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickPrompt(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      rows={2}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || aiMutation.isPending}
                      className="px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function buildSystemContext(mode, profile, applications, courses, universities) {
  const baseContext = `You are an expert study abroad counselor with deep knowledge of international education. You help students find the best universities, write compelling essays, navigate applications, and succeed in their study abroad journey.`;

  const profileContext = profile ? `

Student Profile:
- Name: ${profile.first_name} ${profile.last_name}
- Education: ${profile.education_history?.[0]?.academic_level || 'Not specified'}
- Study Destination: ${profile.admission_preferences?.study_destination || 'Not specified'}
- Study Level: ${profile.admission_preferences?.study_level || 'Not specified'}
- Study Area: ${profile.admission_preferences?.study_area || 'Not specified'}
- English Test: ${profile.english_proficiency?.test_type || 'Not specified'} - ${profile.english_proficiency?.overall_score || 'N/A'}
- Active Applications: ${applications.length}
` : '';

  const modeContext = {
    recommendations: `
Mode: University Recommendations
Analyze the student's profile carefully and recommend 3-5 universities that match their:
- Academic background and grades
- Desired major/field of study
- Budget considerations
- English proficiency level
- Study destination preferences

For each recommendation, explain WHY it's a good fit and mention specific programs, entry requirements, and scholarship opportunities.`,
    
    essay: `
Mode: Essay Guidance
Help the student with their application essays by:
- Brainstorming unique angles and stories from their background
- Structuring their essay effectively (hook, body, conclusion)
- Tailoring content to specific university values and requirements
- Providing constructive feedback on their drafts
- Suggesting powerful language and avoiding clichés
Be encouraging and help them find their authentic voice.`,
    
    faq: `
Mode: FAQ & General Help
Answer questions about:
- Application processes and timelines
- Visa requirements for different countries
- Cost of living and financial planning
- Scholarship opportunities
- Cultural adaptation and student life
- Academic requirements and test scores
Provide accurate, up-to-date information with specific examples when possible.`,
    
    deadlines: `
Mode: Proactive Advice & Deadlines
Based on the student's current application status and profile:
- Identify upcoming deadlines they should focus on
- Highlight potential challenges or gaps in their profile
- Suggest concrete next steps and action items
- Warn about common mistakes to avoid
- Provide a prioritized action plan
Be specific with dates when possible and emphasize urgency where needed.`,
  };

  return `${baseContext}${profileContext}

${modeContext[mode]}

Be conversational, supportive, and specific. Use bullet points and formatting to make information easy to scan.`;
}

function getWelcomeMessage(mode, profile) {
  const name = profile?.first_name || 'there';
  
  const messages = {
    recommendations: `Hi ${name}! 👋 I'm here to help you find universities that are perfect for you. I'll analyze your academic background, interests, and goals to recommend institutions where you can thrive.

Let's start - tell me a bit about what you're looking for in a university, or ask me to analyze your profile!`,
    
    essay: `Hi ${name}! ✍️ I'm here to help you craft compelling application essays that showcase your unique story and strengths.

Whether you're just starting to brainstorm or need feedback on a draft, I'm here to guide you. What would you like to work on today?`,
    
    faq: `Hi ${name}! 💡 I'm here to answer any questions you have about studying abroad - from visa requirements to student life and everything in between.

What would you like to know?`,
    
    deadlines: `Hi ${name}! 📅 I'm here to help you stay on track with your applications. I'll analyze your current status and give you personalized advice on what to focus on next.

Let me review your profile and provide some proactive guidance. How can I help you today?`,
  };

  return messages[mode];
}

function getQuickPrompts(mode) {
  const prompts = {
    recommendations: [
      'Recommend universities for me',
      'What are top programs in my field?',
      'Universities with good scholarships',
    ],
    essay: [
      'Help me brainstorm essay topics',
      'Review my essay structure',
      'How to tailor my essay to this university?',
    ],
    faq: [
      'UK visa requirements',
      'Cost of living in Canada',
      'When should I apply?',
    ],
    deadlines: [
      'What should I do this week?',
      'Am I on track with my applications?',
      'Check for missing documents',
    ],
  };

  return prompts[mode] || [];
}