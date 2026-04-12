import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { PatentsService } from '../patents/patents.service';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.schema';
import { Patent } from '../patents/schemas/patent.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('🌱 Starting database seeding...\n');

    // Get services
    const usersService = app.get(UsersService);
    const patentsService = app.get(PatentsService);

    // Get models for direct access
    const userModel = app.get('UserModel');
    const patentModel = app.get('PatentModel');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await userModel.deleteMany({});
    await patentModel.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Test Innovator',
        email: 'innovator@example.com',
        password: hashedPassword,
        role: 'Innovator',
        country: 'Sri Lanka',
        bio: 'Tech innovator passionate about AI and renewable energy solutions',
        company: 'TechVentures LK',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      },
      {
        name: 'Test investor',
        email: 'investor@example.com',
        password: hashedPassword,
        role: 'Investor',
        country: 'United States',
        bio: 'Venture capitalist investing in emerging tech and sustainable innovation',
        company: 'Global Ventures Capital',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        profile: {
          investmentRange: 'LKR 500K - LKR 2M',
          industries: ['Technology', 'Renewable Energy', 'Healthcare'],
        },
      },
      {
        name: 'Test Manufacturer',
        email: 'manufacturer@example.com',
        password: hashedPassword,
        role: 'Manufacturer',
        country: 'China',
        bio: 'Manufacturing expert specializing in IoT and electronics production',
        company: 'Chen Manufacturing Ltd',
        verified: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
        profile: {
          manufacturingCapacity: 'Large scale electronics and IoT devices',
          industries: ['Electronics', 'IoT', 'Automotive'],
        },
      },
      {
        name: 'Platform Admin',
        email: 'admin@innovatelk.local',
        password: hashedPassword,
        role: 'Admin',
        country: 'Sri Lanka',
        bio: 'Single platform administrator account for operations and moderation',
        company: 'InnovateLK',
        verified: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      },
    ];

    const createdUsers = [];
    for (const userData of users) {
      const user = await userModel.create(userData);
      createdUsers.push(user);
      console.log(`  ✓ Created ${user.role}: ${user.name}`);
    }

    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create patents
    console.log('📋 Creating patents...');

    const patents = [
      {
        title: 'AI-Powered Solar Panel Optimizer',
        patentNumber: 'LK/P/2024/001',
        category: 'Renewable Energy',
        description: 'Revolutionary AI system that optimizes solar panel efficiency using machine learning algorithms to predict optimal angles and cleaning schedules. Increases energy output by up to 35% compared to static installations.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-01-15'),
        status: 'Granted',
        fundingRequired: 'LKR 500,000 - LKR 1,000,000',
        investmentStage: 'Series A',
        tags: ['AI', 'Solar Energy', 'IoT', 'Machine Learning', 'Sustainability'],
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
        technicalDetails: {
          abstract: 'An intelligent solar panel optimization system using AI to maximize energy output',
          claims: ['AI-based angle optimization', 'Predictive maintenance scheduling', 'Weather pattern integration'],
        },
        commercialization: {
          marketSize: 'LKR 50 billion solar energy market',
          targetMarket: ['Residential solar', 'Commercial installations', 'Solar farms'],
          uniqueSellingPoint: '35% efficiency improvement over traditional systems',
          revenueModel: 'Subscription + Hardware sales',
        },
      },
      {
        title: 'Biodegradable Plastic from Seaweed',
        patentNumber: 'LK/P/2024/002',
        category: 'Environmental Technology',
        description: 'Novel process for creating fully biodegradable plastic alternative from locally sourced seaweed. Decomposes naturally within 90 days without harmful residues.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-02-20'),
        status: 'Granted',
        fundingRequired: 'LKR 300,000 - LKR 500,000',
        investmentStage: 'Seed',
        tags: ['Sustainability', 'Biodegradable', 'Ocean', 'Packaging', 'Green Tech'],
        image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
        commercialization: {
          marketSize: 'LKR 8 billion biodegradable packaging market',
          targetMarket: ['Food packaging', 'Retail bags', 'Agricultural films'],
          uniqueSellingPoint: 'Ocean-sourced, carbon negative production',
        },
      },
      {
        title: 'Smart Water Leak Detection System',
        patentNumber: 'LK/P/2024/003',
        category: 'IoT & Smart Cities',
        description: 'IoT-based water leak detection system using acoustic sensors and AI to identify leaks in urban water distribution networks, reducing water waste by up to 40%.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2023-11-10'),
        status: 'Granted',
        fundingRequired: 'LKR 1,000,000 - LKR 2,000,000',
        investmentStage: 'Series A',
        tags: ['IoT', 'Smart City', 'Water', 'AI', 'Infrastructure'],
        image: 'https://images.unsplash.com/photo-1581092583537-20575693e90b?w=800&h=600&fit=crop',
        isPublic: true,
        commercialization: {
          marketSize: 'LKR 15 billion smart water management market',
          targetMarket: ['Municipal water utilities', 'Commercial buildings', 'Industrial facilities'],
        },
      },
      {
        title: 'Portable Medical Diagnostic Device',
        patentNumber: 'LK/P/2024/004',
        category: 'Healthcare & Medical Devices',
        description: 'Handheld device capable of performing 15+ common medical tests using a single blood sample. Provides results in under 5 minutes, perfect for rural healthcare.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-03-05'),
        status: 'Pending',
        fundingRequired: 'LKR 2,000,000 - LKR 5,000,000',
        investmentStage: 'Series B',
        tags: ['Healthcare', 'Diagnostics', 'Medical', 'Rural Health', 'Portable'],
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
        commercialization: {
          marketSize: 'LKR 30 billion point-of-care diagnostics market',
          targetMarket: ['Rural clinics', 'Emergency services', 'Developing countries'],
        },
      },
      {
        title: 'Vertical Farming LED System',
        patentNumber: 'LK/P/2024/005',
        category: 'Agriculture & Food Tech',
        description: 'Energy-efficient LED lighting system specifically designed for vertical farming, reducing energy consumption by 60% while increasing crop yield by 45%.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2023-12-15'),
        status: 'Granted',
        fundingRequired: 'LKR 500,000 - LKR 1,000,000',
        investmentStage: 'Seed',
        tags: ['Agriculture', 'Vertical Farming', 'LED', 'Food Security', 'Urban Farming'],
        image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop',
        isPublic: true,
      },
      {
        title: 'Blockchain-Based Supply Chain Tracker',
        patentNumber: 'LK/P/2024/006',
        category: 'Blockchain & Fintech',
        description: 'Decentralized supply chain tracking system using blockchain technology to ensure product authenticity and reduce counterfeiting in pharmaceutical industry.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-01-20'),
        status: 'Granted',
        fundingRequired: 'LKR 1,000,000 - LKR 2,000,000',
        investmentStage: 'Series A',
        tags: ['Blockchain', 'Supply Chain', 'Pharmaceutical', 'Security', 'Anti-Counterfeit'],
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
        isPublic: true,
      },
      {
        title: 'Wind Turbine Noise Reduction Tech',
        patentNumber: 'LK/P/2024/007',
        category: 'Renewable Energy',
        description: 'Innovative blade design and dampening system that reduces wind turbine noise by 80% without affecting energy output, making wind farms viable in populated areas.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2023-10-30'),
        status: 'Granted',
        fundingRequired: 'LKR 2,000,000 - LKR 3,000,000',
        investmentStage: 'Series B',
        tags: ['Wind Energy', 'Noise Reduction', 'Renewable', 'Clean Energy'],
        image: 'https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
      },
      {
        title: 'AI Tutoring System for STEM Education',
        patentNumber: 'LK/P/2024/008',
        category: 'Education & E-Learning',
        description: 'Adaptive AI-powered tutoring system that personalizes STEM education for K-12 students, improving learning outcomes by 65% based on pilot studies.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-02-10'),
        status: 'Pending',
        fundingRequired: 'LKR 300,000 - LKR 500,000',
        investmentStage: 'Seed',
        tags: ['AI', 'Education', 'EdTech', 'STEM', 'Machine Learning'],
        image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=600&fit=crop',
        isPublic: true,
      },
      {
        title: 'Electric Vehicle Battery Recycling',
        patentNumber: 'LK/P/2024/009',
        category: 'Automotive & Transportation',
        description: 'Efficient and environmentally friendly process for recycling EV batteries, recovering 95% of valuable materials for reuse in new batteries.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2023-09-15'),
        status: 'Granted',
        fundingRequired: 'LKR 5,000,000+',
        investmentStage: 'Series C',
        tags: ['EV', 'Recycling', 'Sustainability', 'Circular Economy', 'Battery'],
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
      },
      {
        title: 'Smart Home Energy Management',
        patentNumber: 'LK/P/2024/010',
        category: 'IoT & Smart Cities',
        description: 'Integrated smart home system that optimizes energy consumption across all devices, reducing electricity bills by up to 40% using predictive algorithms.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-01-05'),
        status: 'Granted',
        fundingRequired: 'LKR 500,000 - LKR 1,000,000',
        investmentStage: 'Seed',
        tags: ['Smart Home', 'IoT', 'Energy', 'AI', 'Automation'],
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop',
        isPublic: true,
      },
      {
        title: 'Drone-Based Crop Monitoring',
        patentNumber: 'LK/P/2024/011',
        category: 'Agriculture & Food Tech',
        description: 'Autonomous drone system with multispectral imaging for early disease detection and precision agriculture, increasing crop yields by 30%.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2023-11-20'),
        status: 'Granted',
        fundingRequired: 'LKR 1,000,000 - LKR 2,000,000',
        investmentStage: 'Series A',
        tags: ['Drones', 'Agriculture', 'AI', 'Precision Farming', 'Computer Vision'],
        image: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=800&h=600&fit=crop',
        isPublic: true,
      },
      {
        title: 'Water Purification Nano-Filter',
        patentNumber: 'LK/P/2024/012',
        category: 'Environmental Technology',
        description: 'Novel nano-filtration membrane that removes 99.99% of contaminants including microplastics, heavy metals, and pathogens from water at low cost.',
        innovator: createdUsers[0]._id,
        innovatorName: createdUsers[0].name,
        innovatorCountry: createdUsers[0].country,
        filingDate: new Date('2024-02-28'),
        status: 'Pending',
        fundingRequired: 'LKR 1,000,000 - LKR 2,000,000',
        investmentStage: 'Seed',
        tags: ['Water', 'Nanotechnology', 'Filtration', 'Clean Water', 'Health'],
        image: 'https://images.unsplash.com/photo-1541844053589-346841d0b34c?w=800&h=600&fit=crop',
        isFeatured: true,
        isPublic: true,
      },
    ].map((patent) => ({
      ...patent,
      moderationStatus: 'approved',
      isPublic: patent.isPublic ?? true,
      adminNotes: 'Seed data approved by default',
    }));

    for (const patentData of patents) {
      const patent = await patentModel.create({
        ...patentData,
        views: Math.floor(Math.random() * 500) + 50,
        interested: Math.floor(Math.random() * 30) + 5,
      });
      console.log(`  ✓ Created patent: ${patent.title}`);
    }

    console.log(`✅ Created ${patents.length} patents\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Patents: ${patents.length}`);
    console.log('\n✨ You can now login with:');
    console.log('   Email: innovator@example.com');
    console.log('   Email: investor@example.com');
    console.log('   Email: manufacturer@example.com');
    console.log('   Email: admin@innovatelk.local');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
