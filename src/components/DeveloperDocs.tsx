import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Code, GitBranch, Database, Server, Rocket, Shield, FileCode } from "lucide-react";
import { Button } from "./ui/button";

export const DeveloperDocs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Code className="w-8 h-8 text-primary" />
          Developer Documentation
        </h2>
        <p className="text-muted-foreground text-lg">
          Technical guide for contributing to GreenSkill Booster and understanding the codebase
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Project Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Technology Stack</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-secondary/30 rounded border">
                <p className="font-semibold">Frontend</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Tailwind CSS</li>
                  <li>Vite</li>
                </ul>
              </div>
              <div className="p-3 bg-secondary/30 rounded border">
                <p className="font-semibold">Backend</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Supabase (PostgreSQL)</li>
                  <li>Edge Functions</li>
                  <li>Row Level Security</li>
                  <li>Realtime subscriptions</li>
                </ul>
              </div>
              <div className="p-3 bg-secondary/30 rounded border">
                <p className="font-semibold">UI Components</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>Shadcn/ui</li>
                  <li>Radix UI primitives</li>
                  <li>Lucide React icons</li>
                  <li>React Hook Form</li>
                </ul>
              </div>
              <div className="p-3 bg-secondary/30 rounded border">
                <p className="font-semibold">Additional Tools</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  <li>React Router v6</li>
                  <li>TanStack Query</li>
                  <li>Mapbox GL</li>
                  <li>Sonner (toasts)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Project Structure</h4>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
{`greenskill-booster/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── LessonCard.tsx  # Lesson display
│   │   └── ...
│   ├── pages/              # Route components
│   │   ├── Index.tsx       # Home page
│   │   ├── Lessons.tsx     # Lesson listing
│   │   ├── LessonDetail.tsx
│   │   └── ...
│   ├── contexts/           # React context providers
│   │   ├── AuthContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── ProgressContext.tsx
│   ├── i18n/               # Internationalization
│   │   └── translations.ts
│   ├── data/               # Static data
│   │   └── lessons.ts      # Lesson content
│   ├── integrations/       # External services
│   │   └── supabase/
│   ├── lib/                # Utilities
│   └── types/              # TypeScript types
├── supabase/
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
└── public/                 # Static assets`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Prerequisites</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Node.js 18+ and npm/yarn/bun</li>
              <li>Git for version control</li>
              <li>Supabase account (for backend features)</li>
              <li>Mapbox account (for map features, optional)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Installation Steps</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">1. Clone the repository</p>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`git clone https://github.com/yourusername/greenskill-booster.git
cd greenskill-booster`}
                </pre>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">2. Install dependencies</p>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`npm install
# or
yarn install
# or
bun install`}
                </pre>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">3. Set up environment variables</p>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`cp .env.example .env
# Edit .env with your Supabase credentials:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </pre>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">4. Run development server</p>
                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`npm run dev
# App will be available at http://localhost:5173`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Schema & API
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tables">
              <AccordionTrigger>Core Database Tables</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="p-3 bg-muted rounded text-xs">
                  <p className="font-semibold mb-2">profiles</p>
                  <pre className="text-muted-foreground">
{`id: uuid (primary key)
username: text
avatar_url: text
is_public: boolean
created_at: timestamp
updated_at: timestamp`}
                  </pre>
                </div>

                <div className="p-3 bg-muted rounded text-xs">
                  <p className="font-semibold mb-2">user_stats</p>
                  <pre className="text-muted-foreground">
{`user_id: uuid (foreign key)
total_actions: integer
total_points: integer
current_streak: integer
longest_streak: integer
last_action_date: date`}
                  </pre>
                </div>

                <div className="p-3 bg-muted rounded text-xs">
                  <p className="font-semibold mb-2">user_achievements</p>
                  <pre className="text-muted-foreground">
{`id: uuid (primary key)
user_id: uuid (foreign key)
achievement_type: text
achievement_name: text
achievement_description: text
achievement_icon: text
points_awarded: integer
earned_at: timestamp`}
                  </pre>
                </div>

                <div className="p-3 bg-muted rounded text-xs">
                  <p className="font-semibold mb-2">climate_actions</p>
                  <pre className="text-muted-foreground">
{`id: uuid (primary key)
user_id: uuid (foreign key)
category: enum (tree_planting, water_saving, etc.)
story: text
photo_url: text
voice_note_url: text
latitude: numeric
longitude: numeric
city: text
country: text
is_public: boolean
points_awarded: integer
created_at: timestamp`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rls">
              <AccordionTrigger>Row Level Security (RLS) Policies</AccordionTrigger>
              <AccordionContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  GreenSkill Booster implements RLS to secure user data. Key policies:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li><strong>profiles:</strong> Users can view public profiles and update their own</li>
                  <li><strong>user_stats:</strong> Users can only access their own statistics</li>
                  <li><strong>user_achievements:</strong> Public viewing, users can manage their own</li>
                  <li><strong>climate_actions:</strong> Public actions viewable by all, users manage their own</li>
                  <li><strong>lesson_suggestions:</strong> Users view their own, admins view all</li>
                </ul>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 mt-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Important:</strong> Always test RLS policies to ensure data security. 
                    Use <code className="bg-background px-1 rounded">auth.uid()</code> for user-specific queries.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="api">
              <AccordionTrigger>API Usage Examples</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="p-3 bg-muted rounded">
                  <p className="font-semibold text-sm mb-2">Fetching User Achievements</p>
                  <pre className="text-xs bg-background p-2 rounded overflow-x-auto text-muted-foreground">
{`const { data, error } = await supabase
  .from('user_achievements')
  .select('*')
  .eq('user_id', user.id)
  .order('earned_at', { ascending: false });`}
                  </pre>
                </div>

                <div className="p-3 bg-muted rounded">
                  <p className="font-semibold text-sm mb-2">Creating Climate Action</p>
                  <pre className="text-xs bg-background p-2 rounded overflow-x-auto text-muted-foreground">
{`const { data, error } = await supabase
  .from('climate_actions')
  .insert({
    user_id: user.id,
    category: 'tree_planting',
    story: 'Planted 5 trees today!',
    latitude: 40.7128,
    longitude: -74.0060,
    city: 'New York',
    country: 'USA',
    is_public: true,
    points_awarded: 10
  });`}
                  </pre>
                </div>

                <div className="p-3 bg-muted rounded">
                  <p className="font-semibold text-sm mb-2">Realtime Subscriptions</p>
                  <pre className="text-xs bg-background p-2 rounded overflow-x-auto text-muted-foreground">
{`const channel = supabase
  .channel('climate-actions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'climate_actions',
      filter: 'is_public=eq.true'
    },
    (payload) => {
      // Handle new action
    }
  )
  .subscribe();`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Edge Functions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Serverless functions for backend logic. Current edge functions:
          </p>

          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">get-mapbox-token</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Returns Mapbox API token for map features. Protects API key from client exposure.
              </p>
              <div className="p-2 bg-muted rounded text-xs">
                <p className="font-medium mb-1">Endpoint:</p>
                <code>/functions/v1/get-mapbox-token</code>
                <p className="font-medium mt-2 mb-1">Returns:</p>
                <pre className="text-muted-foreground">{`{ token: string }`}</pre>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">text-to-speech</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Converts lesson text to audio using AI. Used for voice narration features.
              </p>
              <div className="p-2 bg-muted rounded text-xs">
                <p className="font-medium mb-1">Endpoint:</p>
                <code>/functions/v1/text-to-speech</code>
                <p className="font-medium mt-2 mb-1">Parameters:</p>
                <pre className="text-muted-foreground">{`{ text: string, language?: string }`}</pre>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-2">Creating New Edge Functions</p>
            <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
{`# Create new function
supabase functions new my-function

# Deploy function
supabase functions deploy my-function

# Test locally
supabase functions serve`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5" />
            Contribution Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Code Standards</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Use TypeScript for all new code</li>
              <li>Follow existing component patterns and file structure</li>
              <li>Use functional components with hooks</li>
              <li>Implement proper error handling and loading states</li>
              <li>Add JSDoc comments for complex functions</li>
              <li>Use semantic HTML and ARIA attributes for accessibility</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Pull Request Process</h4>
            <div className="space-y-2">
              <div className="flex gap-3 items-start text-sm">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs">1</span>
                <p className="text-muted-foreground">Fork the repository and create a feature branch</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs">2</span>
                <p className="text-muted-foreground">Make your changes following code standards</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs">3</span>
                <p className="text-muted-foreground">Test thoroughly in development environment</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs">4</span>
                <p className="text-muted-foreground">Write descriptive commit messages</p>
              </div>
              <div className="flex gap-3 items-start text-sm">
                <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xs">5</span>
                <p className="text-muted-foreground">Submit PR with clear description of changes</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="font-semibold mb-2">Areas We Need Help</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Adding new lesson content and interactive activities</li>
              <li>Improving accessibility features</li>
              <li>Performance optimization</li>
              <li>Mobile responsive design enhancements</li>
              <li>Writing tests (unit and integration)</li>
              <li>Documentation improvements</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-2 text-muted-foreground">
            <p><strong>🔒 Never commit secrets:</strong> Use environment variables for all API keys and tokens</p>
            <p><strong>🔒 Validate user input:</strong> Always sanitize and validate data from forms</p>
            <p><strong>🔒 Use RLS policies:</strong> Implement proper Row Level Security for all database tables</p>
            <p><strong>🔒 Secure file uploads:</strong> Validate file types and sizes before storage</p>
            <p><strong>🔒 Rate limiting:</strong> Implement rate limits for API endpoints to prevent abuse</p>
            <p><strong>🔒 Auth checks:</strong> Always verify user authentication before allowing actions</p>
          </div>

          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="font-semibold text-destructive mb-2">⚠️ Common Security Mistakes to Avoid</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Exposing Supabase service role key in client code</li>
              <li>Creating database policies that allow unauthorized access</li>
              <li>Not validating file uploads properly</li>
              <li>Storing sensitive data in localStorage</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Deployment Options</h4>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded">
                <p className="font-semibold text-sm mb-1">Lovable (Recommended)</p>
                <p className="text-xs text-muted-foreground">
                  Deploy directly from Lovable platform. Automatic builds, preview URLs, and custom domains supported.
                </p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-semibold text-sm mb-1">Vercel / Netlify</p>
                <p className="text-xs text-muted-foreground">
                  Connect GitHub repo for automatic deployments. Configure environment variables in platform dashboard.
                </p>
              </div>
              <div className="p-3 bg-muted rounded">
                <p className="font-semibold text-sm mb-1">Self-hosted</p>
                <p className="text-xs text-muted-foreground">
                  Build with <code className="bg-background px-1 rounded">npm run build</code> and serve the dist folder with any static hosting.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Environment Variables for Production</h4>
            <div className="p-3 bg-muted rounded text-xs">
              <pre className="text-muted-foreground">
{`VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token (optional)`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support & Community</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1">
              <GitBranch className="w-4 h-4 mr-2" />
              GitHub Issues
            </Button>
            <Button variant="outline" className="flex-1">
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </Button>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm">
            <p className="font-semibold mb-2">Technical Questions?</p>
            <p className="text-muted-foreground">
              For developer support and technical questions, contact:
              <strong className="block mt-1">osamas.bizz@gmail.com</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
