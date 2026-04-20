import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Languages, BookMarked, FileCheck, Globe2, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";

export const TranslatorDocs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Languages className="w-8 h-8 text-primary" />
          Translator's Guide
        </h2>
        <p className="text-muted-foreground text-lg">
          Guidelines and best practices for translating GreenSkill Booster content while maintaining 
          cultural relevance and educational impact
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe2 className="w-5 h-5" />
            Translation Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Core Principles</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Accuracy over literal translation:</strong> Prioritize conveying the correct meaning 
                and educational value rather than word-for-word translation</li>
                <li><strong>Cultural adaptation:</strong> Adapt examples, analogies, and references to be relevant 
                to the target culture while preserving the core message</li>
                <li><strong>Consistency:</strong> Use consistent terminology throughout all lessons and maintain 
                the same translation for technical terms</li>
                <li><strong>Age-appropriateness:</strong> Match the language complexity to the target age group 
                specified in each lesson</li>
                <li><strong>Inclusive language:</strong> Use gender-neutral language where possible and avoid 
                cultural biases or stereotypes</li>
              </ul>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Voice and Tone
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                GreenSkill Booster uses an encouraging, educational, and action-oriented tone. 
                Translations should maintain this voice:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Be positive and empowering (not alarmist or guilt-inducing)</li>
                <li>Use active voice and clear, direct language</li>
                <li>Keep sentences concise for mobile readability</li>
                <li>Maintain enthusiasm without being overly casual</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookMarked className="w-5 h-5" />
            Translation Glossary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Key terms and their translations. Always use these standardized translations for consistency:
            </p>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="climate">
                <AccordionTrigger>Climate & Environment Terms</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Climate Change</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Cambio Climático</Badge>
                        <Badge variant="outline">FR: Changement Climatique</Badge>
                        <Badge variant="outline">AR: تغير المناخ</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Renewable Energy</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Energía Renovable</Badge>
                        <Badge variant="outline">FR: Énergie Renouvelable</Badge>
                        <Badge variant="outline">AR: الطاقة المتجددة</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Carbon Footprint</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Huella de Carbono</Badge>
                        <Badge variant="outline">FR: Empreinte Carbone</Badge>
                        <Badge variant="outline">AR: البصمة الكربونية</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Sustainability</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Sostenibilidad</Badge>
                        <Badge variant="outline">FR: Durabilité</Badge>
                        <Badge variant="outline">AR: الاستدامة</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Biodiversity</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Biodiversidad</Badge>
                        <Badge variant="outline">FR: Biodiversité</Badge>
                        <Badge variant="outline">AR: التنوع البيولوجي</Badge>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="platform">
                <AccordionTrigger>Platform-Specific Terms</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-muted rounded">
                      <p className="font-semibold mb-2">Note: These terms should NOT be translated</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>"GreenSkill Booster" - Keep as brand name</li>
                        <li>Badge names (e.g., "Week Warrior", "Climate Champion") - Keep in English</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Lesson</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Lección</Badge>
                        <Badge variant="outline">FR: Leçon</Badge>
                        <Badge variant="outline">HI: पाठ</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Achievement/Badge</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Insignia</Badge>
                        <Badge variant="outline">FR: Badge</Badge>
                        <Badge variant="outline">HI: बैज</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Streak</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Racha</Badge>
                        <Badge variant="outline">FR: Série</Badge>
                        <Badge variant="outline">HI: लकीर</Badge>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="actions">
                <AccordionTrigger>Climate Action Categories</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Tree Planting</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Plantación de Árboles</Badge>
                        <Badge variant="outline">FR: Plantation d'Arbres</Badge>
                        <Badge variant="outline">SW: Kupanda Miti</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Water Saving</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Ahorro de Agua</Badge>
                        <Badge variant="outline">FR: Économie d'Eau</Badge>
                        <Badge variant="outline">SW: Kuokoa Maji</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-start p-2 hover:bg-muted rounded">
                      <span className="font-medium">Recycling</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <Badge variant="outline">ES: Reciclaje</Badge>
                        <Badge variant="outline">FR: Recyclage</Badge>
                        <Badge variant="outline">SW: Kurejea</Badge>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="p-4 bg-muted rounded-lg text-sm">
              <p className="font-semibold mb-1">Download Complete Glossary:</p>
              <p className="text-muted-foreground">
                A comprehensive term database with translations for all 13 supported languages is available 
                for download. Contact the translation coordinator to access the full glossary spreadsheet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            Quality Standards & Review Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Translation Quality Checklist</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <p className="font-medium">Accuracy</p>
                  <p className="text-muted-foreground">Content meaning is preserved and scientifically correct</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <p className="font-medium">Readability</p>
                  <p className="text-muted-foreground">Text flows naturally in the target language</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <p className="font-medium">Cultural Relevance</p>
                  <p className="text-muted-foreground">Examples and references are appropriate for target audience</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <p className="font-medium">Consistency</p>
                  <p className="text-muted-foreground">Terminology matches glossary and previous translations</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-secondary/30 rounded">
                <input type="checkbox" className="mt-1" disabled />
                <div>
                  <p className="font-medium">Formatting</p>
                  <p className="text-muted-foreground">UI elements, placeholders, and special characters are correct</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Review Process</h4>
            <div className="space-y-3">
              <div className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
                <div className="text-sm">
                  <p className="font-medium">Initial Translation</p>
                  <p className="text-muted-foreground">Translator completes content using glossary and guidelines</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
                <div className="text-sm">
                  <p className="font-medium">Self-Review</p>
                  <p className="text-muted-foreground">Translator reviews their work using quality checklist</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
                <div className="text-sm">
                  <p className="font-medium">Peer Review</p>
                  <p className="text-muted-foreground">Another native speaker reviews for accuracy and naturalness</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</span>
                <div className="text-sm">
                  <p className="font-medium">Technical Check</p>
                  <p className="text-muted-foreground">Verify formatting, placeholders, and special characters</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</span>
                <div className="text-sm">
                  <p className="font-medium">Final Approval</p>
                  <p className="text-muted-foreground">Translation coordinator approves for publication</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cultural Adaptation Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Effective localization goes beyond translation. Consider these cultural adaptation strategies:
          </p>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Examples & Analogies</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Replace culturally-specific examples with locally relevant ones:
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong>Original:</strong> "Solar panels can reduce electricity bills by 50%"</p>
                <p><strong>Adapted:</strong> Adjust percentage based on local solar conditions and energy costs</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Units & Measurements</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Convert units to what's commonly used in the target region:
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>• Temperature: Celsius vs. Fahrenheit</p>
                <p>• Distance: Kilometers vs. Miles</p>
                <p>• Volume: Liters vs. Gallons</p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Visual References</h4>
              <p className="text-sm text-muted-foreground">
                When lessons reference images or diagrams, ensure visual content is culturally appropriate 
                and recognizable to the target audience. Flag any images that may need localized versions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>For Translation Coordinators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold mb-2">Managing Translation Projects</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Assign lessons based on translator expertise and availability</li>
              <li>Maintain shared glossary and style guide documents</li>
              <li>Hold regular translator meetings to discuss challenges</li>
              <li>Track translation progress and quality metrics</li>
              <li>Coordinate with educators to gather feedback on translations</li>
            </ul>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold mb-2">Join Our Translation Community</p>
            <p className="text-sm text-muted-foreground mb-2">
              Interested in contributing translations? Contact us at:
            </p>
            <p className="text-sm font-medium">haliimaakhan@gmail.com</p>
            <p className="text-xs text-muted-foreground mt-2">
              We especially need translators for: Portuguese, Chinese, Japanese, Korean, German, and Italian
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
