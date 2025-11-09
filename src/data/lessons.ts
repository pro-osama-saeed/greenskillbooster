import { Lesson } from "@/types/lesson";
import diagramRainwater from "@/assets/diagram-rainwater.jpg";
import diagramComposting from "@/assets/diagram-composting.jpg";
import diagramCleanup from "@/assets/diagram-cleanup.jpg";
import diagramEnergy from "@/assets/diagram-energy.jpg";
import diagramBiodiversity from "@/assets/diagram-biodiversity.jpg";
import diagramRecycling from "@/assets/diagram-recycling.jpg";
import diagramCommunication from "@/assets/diagram-communication.jpg";

export const lessons: Lesson[] = [
  {
    id: "solar-basics",
    title: "Solar Power Basics",
    description: "Learn the fundamentals of solar energy and how it can power homes and businesses.",
    category: "solar",
    duration: 5,
    content: `Solar energy is one of the cleanest and most abundant renewable energy sources available. 
    
Solar panels convert sunlight into electricity using photovoltaic cells. These cells are made of semiconductor materials that generate an electric current when exposed to sunlight.

Key benefits of solar power:
- Clean, renewable energy source
- Reduces electricity bills
- Low maintenance costs
- Creates local jobs
- Reduces carbon footprint

Solar systems can be installed on rooftops, in fields, or even on water bodies. They work best in areas with plenty of sunlight, but modern panels can generate power even on cloudy days.`,
    objectives: [
      "Understand how solar panels work",
      "Learn the benefits of solar energy",
      "Identify good locations for solar installation",
      "Calculate basic solar power potential"
    ],
    didYouKnow: "A single solar panel can power an LED lightbulb for up to 36 hours!",
    quiz: [
      {
        id: "q1",
        question: "What do solar panels convert into electricity?",
        options: ["Wind", "Water", "Sunlight", "Heat"],
        correctAnswer: 2
      },
      {
        id: "q2",
        question: "Which material is commonly used in solar cells?",
        options: ["Wood", "Semiconductor", "Plastic", "Metal"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "rainwater-harvesting",
    title: "Rainwater Harvesting",
    description: "Master techniques to collect and store rainwater for household and garden use.",
    category: "water",
    duration: 6,
    diagramUrl: diagramRainwater,
    content: `Rainwater harvesting captures rain from roofs and surfaces, storing it for later use. This ancient practice is becoming crucial as water scarcity increases globally.

Basic rainwater harvesting system:
1. Catchment area (roof or surface)
2. Gutters and downpipes
3. First flush device (removes initial dirty water)
4. Storage tank
5. Distribution system

Benefits:
- Reduces water bills by 30-50%
- Decreases demand on municipal supply
- Provides water during shortages
- Reduces soil erosion and flooding
- Free from chemicals like chlorine

A 100 square meter roof can collect approximately 80,000 liters of water annually in areas with moderate rainfall!`,
    objectives: [
      "Design a basic rainwater harvesting system",
      "Calculate rainwater collection potential",
      "Understand filtration and storage",
      "Implement water quality measures"
    ],
    didYouKnow: "Ancient civilizations in Rome and India used rainwater harvesting over 2,000 years ago!",
    checklistActivity: {
      id: "rainwater-checklist",
      title: "Rainwater Harvesting Setup Checklist",
      instruction: "Check off each step as you plan your rainwater harvesting system:",
      items: [
        {
          id: "item1",
          text: "Calculate your roof catchment area",
          tip: "Multiply length × width of your roof to get square meters"
        },
        {
          id: "item2",
          text: "Check local regulations and permissions",
          tip: "Some areas have specific rules about rainwater collection"
        },
        {
          id: "item3",
          text: "Choose appropriate tank size",
          tip: "Consider your rainfall pattern and water needs"
        },
        {
          id: "item4",
          text: "Install gutters and downpipes",
          tip: "Ensure they're clean and well-maintained"
        },
        {
          id: "item5",
          text: "Add a first flush device",
          tip: "This diverts the first rain which may contain roof contaminants"
        }
      ]
    }
  },
  {
    id: "composting-basics",
    title: "Composting for Beginners",
    description: "Turn organic waste into valuable soil amendment while reducing landfill waste.",
    category: "waste",
    duration: 6,
    diagramUrl: diagramComposting,
    content: `Composting recycles organic materials into nutrient-rich soil, reducing waste and improving plant growth.

What to compost:
✓ Fruit and vegetable scraps
✓ Coffee grounds and tea bags
✓ Eggshells
✓ Yard waste (leaves, grass)
✓ Paper and cardboard

What NOT to compost:
✗ Meat and dairy
✗ Oils and fats
✗ Pet waste
✗ Diseased plants

Basic composting steps:
1. Choose a bin or pile location
2. Layer green (nitrogen) and brown (carbon) materials
3. Keep moist but not soggy
4. Turn regularly for air circulation
5. Wait 2-6 months for finished compost

Composting diverts up to 30% of household waste from landfills and creates free, high-quality fertilizer.`,
    objectives: [
      "Understand composting benefits",
      "Set up a compost system",
      "Balance green and brown materials",
      "Troubleshoot common issues"
    ],
    didYouKnow: "Food waste in landfills produces methane, a greenhouse gas 25x more potent than CO2!",
    dragDropActivity: {
      id: "compost-sorting",
      title: "Sort the Compost",
      instruction: "Drag each item to the correct category:",
      items: [
        { id: "apple", text: "Apple cores", correctCategory: "compost" },
        { id: "meat", text: "Meat scraps", correctCategory: "nocompost" },
        { id: "leaves", text: "Dried leaves", correctCategory: "compost" },
        { id: "oil", text: "Cooking oil", correctCategory: "nocompost" },
        { id: "eggshells", text: "Eggshells", correctCategory: "compost" },
        { id: "dairy", text: "Cheese", correctCategory: "nocompost" }
      ],
      categories: [
        { id: "compost", title: "✅ Can Compost" },
        { id: "nocompost", title: "❌ Don't Compost" }
      ]
    },
    quiz: [
      {
        id: "q1",
        question: "Which should NOT go in compost?",
        options: ["Apple cores", "Meat scraps", "Coffee grounds", "Leaves"],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "How long does composting typically take?",
        options: ["1 week", "2-6 months", "1 year", "2 years"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "community-cleanups",
    title: "Organizing Community Cleanups",
    description: "Learn to mobilize your neighborhood for impactful environmental action.",
    category: "community",
    duration: 7,
    diagramUrl: diagramCleanup,
    content: `Community cleanups bring people together while improving local environments. Here's how to organize successful events:

Planning phase:
1. Choose a location (beach, park, street)
2. Set a date and backup date
3. Get necessary permissions from authorities
4. Partner with local organizations
5. Create a communication plan

Promotion:
- Use social media and local groups
- Create eye-catching posters
- Contact local media
- Engage schools and businesses
- Set up online registration

Day-of essentials:
- Gloves, bags, and tools
- First aid kit
- Water and refreshments
- Sign-in sheet
- Safety briefing
- Proper waste sorting stations

Follow-up:
- Share photos and results
- Thank volunteers and sponsors
- Report waste collected
- Plan next event

A well-organized cleanup can remove hundreds of kilograms of waste while building community spirit!`,
    objectives: [
      "Plan and organize cleanup events",
      "Recruit and manage volunteers",
      "Handle logistics and safety",
      "Maximize environmental impact"
    ],
    didYouKnow: "Ocean Conservancy's cleanups have removed over 150 million kg of trash since 1986!",
    checklistActivity: {
      id: "cleanup-checklist",
      title: "Community Cleanup Checklist",
      instruction: "Use this checklist when organizing your cleanup event:",
      items: [
        {
          id: "item1",
          text: "Select cleanup location and get permissions",
          tip: "Contact local authorities at least 2 weeks in advance"
        },
        {
          id: "item2",
          text: "Set date and register event online",
          tip: "Weekend mornings usually get best attendance"
        },
        {
          id: "item3",
          text: "Gather supplies (gloves, bags, first aid)",
          tip: "Ask local businesses to sponsor supplies"
        },
        {
          id: "item4",
          text: "Promote through social media and flyers",
          tip: "Share 2-3 weeks before the event"
        },
        {
          id: "item5",
          text: "Brief volunteers on safety and sorting",
          tip: "Create teams with leaders for different areas"
        },
        {
          id: "item6",
          text: "Document and share results",
          tip: "Take before/after photos and weigh collected waste"
        }
      ]
    }
  },
  {
    id: "energy-saving-home",
    title: "Energy Saving at Home",
    description: "Simple ways to reduce energy consumption and save money.",
    category: "energy",
    duration: 5,
    diagramUrl: diagramEnergy,
    content: `Improving home energy efficiency reduces bills and carbon emissions significantly.

Quick efficiency improvements:
- Switch to LED bulbs (use 75% less energy)
- Unplug devices when not in use
- Use natural light during the day
- Seal air leaks around windows and doors
- Insulate walls and attic

Smart energy habits:
- Run full loads in dishwasher and washing machine
- Dry clothes on a line instead of using dryer
- Keep refrigerator at optimal temperature (37-40°F)
- Use ceiling fans instead of AC when possible
- Lower water heater temperature to 120°F

Heating and cooling tips:
- Use programmable thermostat
- Close curtains in summer, open in winter
- Service HVAC systems annually
- Use weather stripping
- Install double-pane windows

An energy-efficient home can reduce energy bills by 25-50% while creating a more comfortable living environment.`,
    objectives: [
      "Identify energy waste in homes",
      "Implement cost-effective improvements",
      "Develop energy-saving habits",
      "Calculate potential savings"
    ],
    didYouKnow: "Phantom power from devices on standby costs US households $100-200 per year!",
    dragDropActivity: {
      id: "energy-sorting",
      title: "Energy Savers vs Wasters",
      instruction: "Sort these habits by their energy impact:",
      items: [
        { id: "led", text: "Using LED bulbs", correctCategory: "saver" },
        { id: "standby", text: "Leaving devices on standby", correctCategory: "waster" },
        { id: "natural", text: "Using natural daylight", correctCategory: "saver" },
        { id: "ac", text: "Leaving AC on when out", correctCategory: "waster" },
        { id: "line", text: "Line-drying clothes", correctCategory: "saver" },
        { id: "old", text: "Using old appliances", correctCategory: "waster" }
      ],
      categories: [
        { id: "saver", title: "💚 Energy Saver" },
        { id: "waster", title: "⚠️ Energy Waster" }
      ]
    }
  },
  {
    id: "local-biodiversity",
    title: "Supporting Local Biodiversity",
    description: "Create habitats that support native plants, pollinators, and wildlife.",
    category: "trees",
    duration: 6,
    diagramUrl: diagramBiodiversity,
    content: `Biodiversity is declining rapidly, but everyone can help by creating wildlife-friendly spaces.

Creating pollinator gardens:
- Plant native flowers that bloom in different seasons
- Avoid pesticides and herbicides
- Provide water sources (birdbaths, shallow dishes)
- Leave some areas "messy" (dead wood, leaf litter)
- Plant in clusters for better visibility

Native plants benefits:
- Adapted to local climate (less water/care)
- Support local wildlife and insects
- More resistant to pests and diseases
- Preserve regional character
- Support entire food webs

Wildlife-friendly features:
- Bird houses and bat boxes
- Log piles for insects and small animals
- Hedgerows instead of fences
- Chemical-free lawn care
- Composting areas

Even small gardens can support dozens of species. A typical native plant supports 10x more wildlife than exotic species!`,
    objectives: [
      "Identify native plant species",
      "Create pollinator-friendly spaces",
      "Support local wildlife",
      "Reduce harmful practices"
    ],
    didYouKnow: "A single oak tree can support over 2,300 species of insects, birds, and mammals!",
    checklistActivity: {
      id: "biodiversity-checklist",
      title: "Biodiversity Action Checklist",
      instruction: "Transform your space into a wildlife haven:",
      items: [
        {
          id: "item1",
          text: "Research native plants for your region",
          tip: "Check with local nurseries or conservation groups"
        },
        {
          id: "item2",
          text: "Stop using chemical pesticides and herbicides",
          tip: "Try natural alternatives like neem oil or companion planting"
        },
        {
          id: "item3",
          text: "Add a water source for wildlife",
          tip: "Change water every 2-3 days to prevent mosquitoes"
        },
        {
          id: "item4",
          text: "Leave a wild corner or dead wood",
          tip: "These provide crucial habitat for beneficial insects"
        },
        {
          id: "item5",
          text: "Plant flowers that bloom across seasons",
          tip: "This provides year-round food for pollinators"
        }
      ]
    }
  },
  {
    id: "recycling-right",
    title: "Recycling Right",
    description: "Master the art of proper recycling and reduce contamination.",
    category: "waste",
    duration: 5,
    diagramUrl: diagramRecycling,
    content: `Recycling only works when done correctly. Contaminated recycling often ends up in landfills.

Know your recyclables:
✓ Clean paper and cardboard
✓ Glass bottles and jars
✓ Aluminum and steel cans
✓ Plastic bottles #1 and #2
✓ Clean pizza boxes (top part only)

Common mistakes:
✗ Greasy pizza boxes (bottom)
✗ Plastic bags (return to stores)
✗ Styrofoam
✗ Food-contaminated items
✗ Clothes and textiles (donate instead)

Golden rules:
1. Empty, clean, and dry items
2. Keep lids on bottles
3. Don't bag recyclables
4. When in doubt, throw it out
5. Check local guidelines

Recycling impact:
- Aluminum: Saves 95% energy vs new
- Paper: Saves 17 trees per ton
- Glass: Can be recycled infinitely
- Plastic: Each ton saves 5,774 kWh energy

One contaminated item can ruin an entire batch of recyclables!`,
    objectives: [
      "Identify recyclable materials",
      "Avoid contamination",
      "Understand local systems",
      "Reduce overall waste"
    ],
    didYouKnow: "Only 9% of all plastic ever made has been recycled. Most ends up in landfills or oceans!",
    dragDropActivity: {
      id: "recycle-sorting",
      title: "Recycling Bin or Trash?",
      instruction: "Sort these items correctly:",
      items: [
        { id: "can", text: "Clean soda can", correctCategory: "recycle" },
        { id: "greasy", text: "Greasy pizza box bottom", correctCategory: "trash" },
        { id: "glass", text: "Glass jar (cleaned)", correctCategory: "recycle" },
        { id: "plastic-bag", text: "Plastic grocery bag", correctCategory: "trash" },
        { id: "cardboard", text: "Clean cardboard box", correctCategory: "recycle" },
        { id: "styrofoam", text: "Styrofoam cup", correctCategory: "trash" }
      ],
      categories: [
        { id: "recycle", title: "♻️ Recycle" },
        { id: "trash", title: "🗑️ Trash" }
      ]
    },
    quiz: [
      {
        id: "q1",
        question: "What should you do with plastic grocery bags?",
        options: ["Put in recycling bin", "Return to store collection", "Throw in trash", "Compost them"],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "Why is contamination bad for recycling?",
        options: ["It makes bins dirty", "One contaminated item can ruin an entire batch", "It's not actually bad", "It only affects paper"],
        correctAnswer: 1
      },
      {
        id: "q3",
        question: "What should you do before recycling containers?",
        options: ["Leave food inside", "Empty, clean, and dry", "Remove all labels", "Crush them flat"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "climate-communication",
    title: "Climate Communication Skills",
    description: "Learn to talk about climate change effectively and inspire action.",
    category: "communication",
    duration: 7,
    diagramUrl: diagramCommunication,
    content: `Communicating about climate change is challenging but crucial. Here's how to do it effectively:

Key principles:
1. Lead with values, not data
2. Use personal stories
3. Focus on solutions
4. Make it local and relevant
5. Acknowledge emotions

Effective techniques:
- Start with shared values (health, family, community)
- Use visuals and metaphors
- Connect to people's daily lives
- Highlight co-benefits (jobs, health, savings)
- Share positive examples
- Avoid doom and gloom
- Listen actively

Handling skepticism:
- Don't argue with denial
- Find common ground
- Ask questions to understand concerns
- Share credible sources
- Focus on local impacts
- Emphasize consensus among scientists

Social media tips:
- Share solutions, not just problems
- Use compelling visuals
- Tell human stories
- Engage respectfully
- Amplify diverse voices

Remember: People act on emotions first, then justify with logic. Connect to hearts before minds.`,
    objectives: [
      "Frame climate messages effectively",
      "Handle difficult conversations",
      "Inspire action without fear",
      "Use storytelling techniques"
    ],
    didYouKnow: "Studies show that hope is more motivating than fear for climate action!",
    quiz: [
      {
        id: "q1",
        question: "What should you lead with when discussing climate?",
        options: ["Scary statistics", "Shared values", "Scientific data", "Political views"],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "How should you handle climate skepticism?",
        options: ["Ignore it", "Argue forcefully", "Find common ground", "Share memes"],
        correctAnswer: 2
      },
      {
        id: "q3",
        question: "What's more motivating for action?",
        options: ["Fear of disaster", "Hope and solutions", "Guilt", "Anger"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "tree-planting",
    title: "Tree Planting & Care",
    description: "Master the techniques of planting trees and maintaining them for maximum impact.",
    category: "trees",
    duration: 7,
    content: `Trees are essential for fighting climate change, providing oxygen, and supporting ecosystems.

Proper tree planting steps:
1. Choose the right tree species for your climate
2. Dig a hole twice as wide as the root ball
3. Place the tree at the correct depth
4. Fill with soil and water thoroughly
5. Add mulch around the base

Tree care basics:
- Water regularly, especially in the first year
- Protect from pests and diseases
- Prune dead or damaged branches
- Monitor growth and health

A single mature tree can absorb up to 48 pounds of CO2 per year and provide shade that reduces cooling costs by up to 30%.`,
    objectives: [
      "Select appropriate tree species",
      "Learn proper planting techniques",
      "Understand tree care requirements",
      "Measure environmental impact"
    ],
    didYouKnow: "Trees can increase property values by 15% and reduce crime in neighborhoods!",
    quiz: [
      {
        id: "q1",
        question: "How wide should the planting hole be?",
        options: ["Same size as root ball", "Twice as wide", "Three times wider", "As deep as possible"],
        correctAnswer: 1
      },
      {
        id: "q2",
        question: "What should be added around the tree base after planting?",
        options: ["Rocks", "Mulch", "Sand", "Nothing"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "water-conservation",
    title: "Water Conservation Methods",
    description: "Discover practical techniques to save water in daily life and agriculture.",
    category: "water",
    duration: 6,
    content: `Water is becoming increasingly scarce in many regions due to climate change and overuse.

Household water conservation:
- Fix leaks immediately (a dripping tap wastes 15 liters/day)
- Install low-flow showerheads and faucets
- Collect rainwater for gardens
- Use water-efficient appliances
- Take shorter showers

Agricultural water conservation:
- Drip irrigation systems (save up to 60% water)
- Mulching to reduce evaporation
- Crop rotation and drought-resistant varieties
- Proper timing of watering

Greywater recycling from washing machines and showers can be treated and reused for irrigation, reducing freshwater consumption by 30-50%.`,
    objectives: [
      "Identify water waste sources",
      "Implement household conservation methods",
      "Learn agricultural water-saving techniques",
      "Calculate water savings potential"
    ],
    didYouKnow: "A 5-minute shower uses about 50 liters of water - reducing by 1 minute saves 10 liters!",
    quiz: [
      {
        id: "q1",
        question: "What is the most efficient irrigation method?",
        options: ["Flood irrigation", "Sprinklers", "Drip irrigation", "Manual watering"],
        correctAnswer: 2
      },
      {
        id: "q2",
        question: "What is greywater?",
        options: ["Dirty water", "Rainwater", "Used household water", "Drinking water"],
        correctAnswer: 2
      }
    ]
  },
  {
    id: "renewable-careers",
    title: "Careers in Renewable Energy",
    description: "Explore job opportunities in the growing green economy.",
    category: "energy",
    duration: 8,
    content: `The renewable energy sector is one of the fastest-growing job markets globally.

Popular green careers:
- Solar Panel Installer (high demand, good pay)
- Wind Turbine Technician
- Energy Auditor
- Environmental Consultant
- Sustainability Coordinator
- Green Building Architect

Skills needed:
- Technical training (often 6-12 months)
- Problem-solving abilities
- Physical fitness (for installation jobs)
- Communication skills
- Basic computer skills

Getting started:
1. Research local training programs
2. Get certified (NABCEP for solar, etc.)
3. Gain hands-on experience through internships
4. Network with industry professionals
5. Stay updated on new technologies

The renewable sector is expected to create 24 million jobs globally by 2030.`,
    objectives: [
      "Identify career paths in green energy",
      "Understand required qualifications",
      "Learn about training opportunities",
      "Explore job market trends"
    ],
    didYouKnow: "Solar installer is one of the fastest-growing jobs, with 60% growth expected!"
  }
];
