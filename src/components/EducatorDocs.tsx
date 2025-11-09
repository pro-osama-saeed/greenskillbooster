import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { BookOpen, Target, Users, Lightbulb, CheckCircle2, Download } from "lucide-react";
import { Button } from "./ui/button";

export const EducatorDocs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-primary" />
          Educator's Guide
        </h2>
        <p className="text-muted-foreground text-lg">
          Complete guide for educators using GreenSkill Booster in classrooms and community programs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Curriculum Integration Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="elementary">
              <AccordionTrigger>Elementary Level (Ages 8-12)</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Learning Outcomes:</strong> Basic environmental awareness, simple climate concepts, 
                  introduction to renewable energy, understanding daily climate actions.
                </p>
                <div>
                  <p className="font-semibold mb-2">Recommended Lessons:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Tree Planting Basics (15 min)</li>
                    <li>Water Conservation at Home (10 min)</li>
                    <li>Introduction to Recycling (10 min)</li>
                    <li>Solar Energy Basics (15 min)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Integration Strategies:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use as starter activities (5-10 min at beginning of class)</li>
                    <li>Assign as homework with parent involvement</li>
                    <li>Create classroom challenges based on lesson actions</li>
                    <li>Display class leaderboard to encourage participation</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="middle">
              <AccordionTrigger>Middle School (Ages 13-15)</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Learning Outcomes:</strong> Understanding climate science, energy systems, 
                  sustainable development, critical thinking about environmental issues.
                </p>
                <div>
                  <p className="font-semibold mb-2">Recommended Lessons:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Climate Change Science (20 min)</li>
                    <li>Renewable Energy Systems (20 min)</li>
                    <li>Sustainable Agriculture (15 min)</li>
                    <li>Community Environmental Projects (15 min)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Integration Strategies:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Link to science curriculum (energy, ecosystems)</li>
                    <li>Use for project-based learning assignments</li>
                    <li>Create student-led climate action clubs</li>
                    <li>Track and present class impact metrics</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="high">
              <AccordionTrigger>High School & Adult (Ages 16+)</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  <strong>Learning Outcomes:</strong> Advanced climate solutions, policy analysis, 
                  career pathways in green economy, leadership skills.
                </p>
                <div>
                  <p className="font-semibold mb-2">Recommended Lessons:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>All curriculum lessons (comprehensive program)</li>
                    <li>Climate Policy and Advocacy (25 min)</li>
                    <li>Green Entrepreneurship (20 min)</li>
                    <li>Advanced Sustainable Technologies (20 min)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Integration Strategies:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use for AP Environmental Science supplementation</li>
                    <li>Integrate with career exploration programs</li>
                    <li>Create capstone projects based on lessons</li>
                    <li>Facilitate community partnerships and real action</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Teaching Tips & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Before the Lesson
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Complete the lesson yourself to understand content and timing</li>
                <li>Test audio/video features to ensure technical readiness</li>
                <li>Prepare discussion questions related to local context</li>
                <li>Set up student accounts in advance (if using platform)</li>
                <li>Review prerequisite knowledge students should have</li>
              </ul>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg border">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                During the Lesson
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Start with a quick brainstorm: "What do you know about [topic]?"</li>
                <li>Pause videos for discussion at key points</li>
                <li>Encourage peer learning - have students explain concepts to each other</li>
                <li>Use interactive activities (drag-drop, checklists) as group exercises</li>
                <li>Connect content to students' daily lives and local community</li>
                <li>Celebrate achievements when students earn badges</li>
              </ul>
            </div>

            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                After the Lesson
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Facilitate reflection: "What action will you take this week?"</li>
                <li>Assign real-world climate actions for students to complete</li>
                <li>Share class progress on the community map</li>
                <li>Connect lessons to broader curriculum themes</li>
                <li>Encourage students to teach family members what they learned</li>
                <li>Track and celebrate collective class impact</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sample Lesson Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-bold text-lg">45-Minute Class Period Plan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">0-5 min:</span>
                <span className="text-muted-foreground">Introduction & hook question related to lesson topic</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">5-20 min:</span>
                <span className="text-muted-foreground">Students complete GreenSkill lesson independently or in pairs</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">20-35 min:</span>
                <span className="text-muted-foreground">Group discussion, share quiz results, plan class action project</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">35-45 min:</span>
                <span className="text-muted-foreground">Reflection activity, assign homework action, preview next lesson</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-bold text-lg">1-Week Unit Plan (5 days)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">Day 1:</span>
                <span className="text-muted-foreground">Introduce unit theme, complete foundational lesson</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">Day 2-3:</span>
                <span className="text-muted-foreground">Complete 2-3 related lessons with discussions</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">Day 4:</span>
                <span className="text-muted-foreground">Plan and begin class climate action project</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-primary min-w-[80px]">Day 5:</span>
                <span className="text-muted-foreground">Present projects, reflect on learning, share on community platform</span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2">
            <Download className="w-4 h-4" />
            Download Full Lesson Plan Templates
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessment & Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Built-in Assessment Tools:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li><strong>Quiz Performance:</strong> Track student understanding through quiz scores</li>
              <li><strong>Badge Progress:</strong> Monitor which students earn achievement badges</li>
              <li><strong>Completion Rates:</strong> View lesson completion statistics</li>
              <li><strong>Action Tracking:</strong> See real-world actions students complete</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Additional Assessment Ideas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Have students create presentations teaching lesson content to others</li>
              <li>Require written reflections on lessons and actions taken</li>
              <li>Assign research projects expanding on lesson topics</li>
              <li>Evaluate student-led community climate action projects</li>
              <li>Use platform data in student portfolios</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Students can download their certificates upon completing all lessons, 
              which can be included in college applications or job portfolios as evidence of climate literacy.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical Support for Educators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Common Questions:</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium">How do I set up student accounts?</p>
                <p className="text-muted-foreground">Students can create their own accounts using email. 
                For younger students, consider creating class accounts or having parents set up accounts.</p>
              </div>
              <div>
                <p className="font-medium">Can I track my students' progress?</p>
                <p className="text-muted-foreground">Use the leaderboard feature to see class progress. 
                Students can also share their achievements and certificates with you.</p>
              </div>
              <div>
                <p className="font-medium">What devices work with GreenSkill Booster?</p>
                <p className="text-muted-foreground">The platform works on any device with a web browser - 
                computers, tablets, and smartphones. Audio features require speakers/headphones.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold mb-2">Need Help?</p>
            <p className="text-sm text-muted-foreground">
              Contact us at <strong>haliimaakhan@gmail.com</strong> for educator support, 
              curriculum questions, or to share your success stories!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
