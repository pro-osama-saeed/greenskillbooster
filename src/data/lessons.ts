import { Lesson } from "@/types/lesson";

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
    id: "energy-efficiency",
    title: "Home Energy Efficiency",
    description: "Learn simple ways to reduce energy consumption and save money.",
    category: "energy",
    duration: 5,
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

An energy-efficient home can reduce energy bills by 25-50% while creating a more comfortable living environment.`,
    objectives: [
      "Identify energy waste in homes",
      "Implement cost-effective improvements",
      "Develop energy-saving habits",
      "Calculate potential savings"
    ],
    quiz: [
      {
        id: "q1",
        question: "How much less energy do LED bulbs use?",
        options: ["25%", "50%", "75%", "90%"],
        correctAnswer: 2
      },
      {
        id: "q2",
        question: "What is a simple way to reduce cooling costs?",
        options: ["Open windows", "Use ceiling fans", "Turn off lights", "Paint walls"],
        correctAnswer: 1
      }
    ]
  },
  {
    id: "composting-basics",
    title: "Composting for Beginners",
    description: "Turn organic waste into valuable soil amendment while reducing landfill waste.",
    category: "trees",
    duration: 6,
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
    ]
  }
];
