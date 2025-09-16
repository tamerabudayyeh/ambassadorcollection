import { constructMetadata } from '@/components/shared/seo'
import { SectionHeading } from '@/components/ui/section-heading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export const metadata = constructMetadata({
  title: 'Careers',
  description: 'Join the Ambassador Collection team. Explore career opportunities in hospitality across our luxury hotels in Jerusalem and Bethlehem.',
  canonicalUrl: '/careers',
})

export default function CareersPage() {
  const jobOpenings = [
    {
      title: "Front Desk Agent",
      location: "Ambassador Jerusalem",
      type: "Full-time",
      department: "Front Office",
      description: "Provide exceptional guest service and manage front desk operations in our flagship Jerusalem property.",
      requirements: ["Fluent in Hebrew, English, and Arabic preferred", "Previous hotel experience", "Excellent communication skills", "Computer literacy"],
      posted: "2024-12-15"
    },
    {
      title: "Head Chef",
      location: "Ambassador Boutique",
      type: "Full-time",
      department: "Food & Beverage",
      description: "Lead our culinary team and create exceptional dining experiences for our guests in downtown Jerusalem.",
      requirements: ["Culinary degree or equivalent experience", "5+ years in senior kitchen role", "Knowledge of kosher and international cuisine", "Leadership skills"],
      posted: "2024-12-10"
    },
    {
      title: "Housekeeping Supervisor",
      location: "Ambassador City - Bethlehem",
      type: "Full-time",
      department: "Housekeeping",
      description: "Supervise housekeeping operations and ensure highest standards of cleanliness and guest satisfaction.",
      requirements: ["Previous supervisory experience", "Attention to detail", "Ability to work in fast-paced environment", "Team leadership skills"],
      posted: "2024-12-08"
    },
    {
      title: "Sales & Marketing Coordinator",
      location: "Corporate Office",
      type: "Full-time",
      department: "Sales & Marketing",
      description: "Support sales initiatives and marketing campaigns across all Ambassador Collection properties.",
      requirements: ["Bachelor's degree in Marketing or related field", "Digital marketing experience", "Proficiency in social media platforms", "Creative thinking"],
      posted: "2024-12-01"
    }
  ]

  const benefits = [
    {
      icon: "💰",
      title: "Competitive Compensation",
      description: "Attractive salary packages with performance-based bonuses and regular reviews."
    },
    {
      icon: "🏥",
      title: "Health & Wellness",
      description: "Comprehensive health insurance, dental coverage, and wellness programs."
    },
    {
      icon: "🎓",
      title: "Learning & Development",
      description: "Professional development opportunities, training programs, and career advancement paths."
    },
    {
      icon: "🏖️",
      title: "Work-Life Balance",
      description: "Generous vacation time, flexible scheduling, and employee discounts at our properties."
    },
    {
      icon: "🍽️",
      title: "Employee Perks",
      description: "Complimentary meals during shifts, discounted stays, and family benefits."
    },
    {
      icon: "🤝",
      title: "Inclusive Culture",
      description: "Diverse, inclusive workplace that values every team member's contribution."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=2070"
            alt="Hotel team members"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-serif font-light mb-6">
            Join Our Team
          </h1>
          <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto">
            Build your career in hospitality with Ambassador Collection
          </p>
          <Button 
            size="lg" 
            className="bg-amber-600 hover:bg-amber-700 text-white"
            data-testid="careers-view-openings"
          >
            View Open Positions
          </Button>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Choose Ambassador Collection"
            subtitle="Discover the benefits of being part of our hospitality family"
            center
            className="mb-16"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center" data-testid={`benefit-${index}`}>
                <CardHeader>
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Current Opportunities"
            subtitle="Explore available positions across our properties"
            center
            className="mb-16"
          />

          <div className="max-w-4xl mx-auto space-y-6">
            {jobOpenings.map((job, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`job-${index}`}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">{job.title}</CardTitle>
                      <CardDescription className="text-base">
                        {job.location} • {job.department}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{job.type}</Badge>
                      <Badge variant="outline">
                        Posted {new Date(job.posted).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{job.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Requirements:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {job.requirements.map((req, reqIndex) => (
                        <li key={reqIndex}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      data-testid={`apply-${index}`}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline"
                      data-testid={`learn-more-${index}`}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Current Openings Alternative */}
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Don't See the Right Position?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  We're always looking for talented individuals to join our team. 
                  Send us your resume and we'll keep you in mind for future opportunities.
                </p>
                <Button 
                  variant="outline" 
                  className="mr-4"
                  data-testid="careers-general-application"
                >
                  Submit General Application
                </Button>
                <Button 
                  variant="ghost"
                  data-testid="careers-job-alerts"
                >
                  Sign Up for Job Alerts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Our Culture & Values"
              center
              className="mb-12"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-serif mb-6">Excellence in Hospitality</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    At Ambassador Collection, we believe that exceptional hospitality begins with exceptional people. 
                    Our team members are the heart of our success, and we're committed to creating an environment 
                    where everyone can thrive.
                  </p>
                  <p>
                    We value diversity, creativity, and a passion for service. Whether you're just starting your 
                    career in hospitality or you're an experienced professional, we offer opportunities for growth 
                    and development in a supportive, family-like atmosphere.
                  </p>
                  <p>
                    Join us in creating memorable experiences for guests from around the world while building 
                    your own rewarding career in the heart of the Holy Land.
                  </p>
                </div>
              </div>
              
              <div className="relative h-96 rounded-lg overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2070"
                  alt="Hotel team collaboration"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <SectionHeading
              title="Application Process"
              subtitle="Here's what to expect when you apply"
              center
              className="mb-12"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center" data-testid="application-step-1">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-medium mb-2">Apply Online</h4>
                <p className="text-sm text-muted-foreground">
                  Submit your application and resume through our online portal
                </p>
              </div>
              
              <div className="text-center" data-testid="application-step-2">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-medium mb-2">Initial Review</h4>
                <p className="text-sm text-muted-foreground">
                  Our HR team reviews your application and qualifications
                </p>
              </div>
              
              <div className="text-center" data-testid="application-step-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-medium mb-2">Interview</h4>
                <p className="text-sm text-muted-foreground">
                  Meet with our hiring team to discuss the role and your experience
                </p>
              </div>
              
              <div className="text-center" data-testid="application-step-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">4</span>
                </div>
                <h4 className="font-medium mb-2">Welcome Aboard</h4>
                <p className="text-sm text-muted-foreground">
                  Join our team and begin your orientation and training
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <SectionHeading
              title="Questions About Careers?"
              subtitle="Our HR team is here to help"
              center
              className="mb-8"
            />
            
            <div className="bg-background p-8 rounded-lg">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Have questions about a specific position or our application process? 
                  We'd love to hear from you.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="mailto:careers@ambassadorcollection.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
                    data-testid="careers-email"
                  >
                    careers@ambassadorcollection.com
                  </a>
                  <a 
                    href="tel:+972-2-123-4567"
                    className="inline-flex items-center justify-center px-6 py-3 border border-border hover:bg-muted transition-colors rounded-md"
                    data-testid="careers-phone"
                  >
                    +972-2-123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}