const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Clear database
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Emily Chen',
      email: 'emily@example.com',
      password,
      image: 'https://randomuser.me/api/portraits/women/12.jpg',
      bio: 'Environmental scientist focusing on urban sustainability projects',
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Dr. Michael Rodriguez',
      email: 'michael@example.com',
      password,
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      bio: 'Marine biologist researching microplastics in ocean ecosystems',
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@example.com',
      password,
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      bio: 'Community organizer working on reforestation and habitat restoration',
    }
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Urban Rooftop Garden Initiative',
      description: 'Transforming urban rooftops into productive green spaces that improve air quality and provide local produce.',
      content: `
        Our urban rooftop garden initiative aims to transform underutilized urban spaces into productive green areas. 
        By implementing rooftop gardens, we can improve air quality, reduce urban heat island effects, and provide fresh, local produce to communities.
        
        ## Key Benefits
        
        - Improved air quality in urban areas
        - Reduced urban heat island effect
        - Increased local food production
        - Creates green spaces for community connection
        - Helps manage stormwater runoff
        
        ## Implementation Strategy
        
        1. Identify suitable rooftops
        2. Assess structural capacity
        3. Design lightweight garden systems
        4. Implement rainwater harvesting
        5. Train community members
        6. Establish maintenance protocols
        
        We've already implemented this approach in three buildings downtown, with impressive results in the first growing season.
      `,
      imageUrl: 'https://images.unsplash.com/photo-1518012312832-96aea3c91144?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Urban Gardening',
      tags: 'sustainability,urban-farming,food-security',
      userId: user1.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Microplastics in Freshwater Systems: A Comprehensive Study',
      description: 'Research paper examining the presence and impact of microplastics in lakes and rivers across North America.',
      content: `
        # Abstract
        
        This study presents a comprehensive analysis of microplastic pollution in freshwater systems across North America. 
        We collected samples from 47 lakes and rivers in different regions and analyzed the concentration, types, and potential sources of microplastics.
        
        # Methodology
        
        Samples were collected using standardized protocols at depths ranging from surface to 100m where applicable.
        Analysis was performed using spectroscopy and microscopic identification techniques.
        
        # Results
        
        Our findings indicate alarming levels of microplastic contamination in 78% of sampled bodies of water,
        with higher concentrations in proximity to urban and industrial centers.
        
        # Conclusion
        
        The ubiquitous presence of microplastics in freshwater systems presents a significant environmental concern requiring immediate policy attention and remediation efforts.
      `,
      imageUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Research',
      tags: 'water-pollution,microplastics,freshwater',
      userId: user2.id
    }
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Community-Led Reforestation Project',
      description: 'Engaging local communities in reforestation efforts to restore degraded land and enhance biodiversity.',
      content: `
        # Community Reforestation Project
        
        Our community-led reforestation initiative focuses on restoring native forest ecosystems while empowering local communities as stewards of their natural resources.
        
        ## Project Goals
        
        - Plant 50,000 native trees in degraded areas
        - Restore wildlife corridors between fragmented habitats
        - Reduce soil erosion and improve watershed health
        - Create sustainable livelihoods through forest products
        - Build local capacity for ecosystem management
        
        ## Community Involvement
        
        The success of this project depends on deep community engagement:
        
        1. Local schools participate in educational programs
        2. Community nurseries grow native seedlings
        3. Volunteer planting events build collective ownership
        4. Training programs develop forest management skills
        5. Monitoring teams track forest health and growth
        
        ## Progress to Date
        
        In the first year, we've planted 12,000 trees with 87% survival rate, engaged 5 schools and 230 community volunteers.
      `,
      imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Conservation',
      tags: 'reforestation,community,biodiversity',
      userId: user3.id
    }
  });

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This project is incredibly innovative! I would love to see this implemented in my city.',
      userId: user3.id,
      projectId: project1.id
    }
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Have you considered the impact on local wildlife? I would be interested in seeing more data on this aspect.',
      userId: user2.id,
      projectId: project1.id
    }
  });

  const comment3 = await prisma.comment.create({
    data: {
      content: 'The methodology section is very thorough. Have you considered analyzing the chemical composition of the plastics to identify sources?',
      userId: user1.id,
      projectId: project2.id
    }
  });

  const comment4 = await prisma.comment.create({
    data: {
      content: 'I\'ve been working on a similar initiative. Would love to connect and share ideas!',
      userId: user3.id,
      projectId: project2.id
    }
  });

  const comment5 = await prisma.comment.create({
    data: {
      content: 'Great work! What species of trees are you prioritizing and why?',
      userId: user1.id,
      projectId: project3.id
    }
  });

  // Create likes
  const like1 = await prisma.like.create({
    data: {
      userId: user2.id,
      projectId: project1.id
    }
  });

  const like2 = await prisma.like.create({
    data: {
      userId: user3.id,
      projectId: project1.id
    }
  });

  const like3 = await prisma.like.create({
    data: {
      userId: user1.id,
      projectId: project2.id
    }
  });

  const like4 = await prisma.like.create({
    data: {
      userId: user3.id,
      projectId: project2.id
    }
  });

  const like5 = await prisma.like.create({
    data: {
      userId: user1.id,
      projectId: project3.id
    }
  });

  const like6 = await prisma.like.create({
    data: {
      userId: user2.id,
      projectId: project3.id
    }
  });

  console.log('Database has been seeded! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 