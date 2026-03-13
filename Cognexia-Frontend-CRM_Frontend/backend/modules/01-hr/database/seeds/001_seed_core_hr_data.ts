import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../../utils/logger';

export class SeedCoreHRData {
  
  static async seed(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      await queryRunner.startTransaction();
      
      logger.info('🌱 Seeding Core HR Data...');

      // 1. Create Organizations
      const organizations = await this.seedOrganizations(queryRunner);
      logger.info(`✅ Created ${organizations.length} organizations`);

      // 2. Create Departments
      const departments = await this.seedDepartments(queryRunner, organizations);
      logger.info(`✅ Created ${departments.length} departments`);

      // 3. Create Positions
      const positions = await this.seedPositions(queryRunner, organizations, departments);
      logger.info(`✅ Created ${positions.length} positions`);

      // 4. Create Employees
      const employees = await this.seedEmployees(queryRunner, organizations, departments, positions);
      logger.info(`✅ Created ${employees.length} employees`);

      // 5. Update department heads
      await this.updateDepartmentHeads(queryRunner, departments, employees);
      logger.info(`✅ Updated department heads`);

      await queryRunner.commitTransaction();
      logger.info('🎉 Core HR seed data created successfully!');
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      logger.error('❌ Failed to seed core HR data:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private static async seedOrganizations(queryRunner: any): Promise<any[]> {
    const organizations = [
      {
        id: uuidv4(),
        name: 'TechManufacture Industries Ltd.',
        code: 'TMI',
        type: 'private_limited',
        industry: 'Manufacturing & Technology',
        size: 'large',
        address: JSON.stringify({
          street: '123 Industrial Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001'
        }),
        contact_info: JSON.stringify({
          phone: '+91-22-12345678',
          email: 'info@techmanufacture.com',
          website: 'https://techmanufacture.com'
        }),
        legal_info: JSON.stringify({
          cin: 'L12345MH2020PLC123456',
          gst: '27AABCT1234A1Z5',
          pan: 'AABCT1234A'
        }),
        settings: JSON.stringify({
          financial_year_start: 'April',
          default_currency: 'INR',
          employee_id_format: 'TMI{YYYY}{####}'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Digital Solutions Pvt. Ltd.',
        code: 'DSL',
        type: 'private_limited',
        industry: 'Information Technology',
        size: 'medium',
        address: JSON.stringify({
          street: '456 Tech Hub',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          pincode: '560001'
        }),
        contact_info: JSON.stringify({
          phone: '+91-80-87654321',
          email: 'contact@digitalsolutions.com',
          website: 'https://digitalsolutions.com'
        }),
        legal_info: JSON.stringify({
          cin: 'L67890KA2021PLC654321',
          gst: '29XYZPQ5678B1C2',
          pan: 'XYZPQ5678B'
        }),
        settings: JSON.stringify({
          financial_year_start: 'April',
          default_currency: 'INR',
          employee_id_format: 'DSL{YYYY}{####}'
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const org of organizations) {
      await queryRunner.query(
        `INSERT INTO organizations (id, name, code, type, industry, size, address, contact_info, legal_info, settings, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [org.id, org.name, org.code, org.type, org.industry, org.size, org.address, org.contact_info, org.legal_info, org.settings, org.is_active, org.created_at, org.updated_at]
      );
    }

    return organizations;
  }

  private static async seedDepartments(queryRunner: any, organizations: any[]): Promise<any[]> {
    const departments = [];
    
    for (const org of organizations) {
      const orgDepartments = [
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Executive Management',
          code: 'EXEC',
          description: 'Executive leadership and strategic management',
          level: 1,
          cost_center_code: 'CC001',
          budget: 5000000.00,
          head_employee_id: null, // Will be updated later
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Human Resources',
          code: 'HR',
          description: 'Human resource management and development',
          level: 1,
          cost_center_code: 'CC002',
          budget: 2000000.00,
          head_employee_id: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Finance & Accounts',
          code: 'FIN',
          description: 'Financial planning, accounting, and reporting',
          level: 1,
          cost_center_code: 'CC003',
          budget: 1500000.00,
          head_employee_id: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Engineering & Development',
          code: 'ENG',
          description: 'Product development and engineering',
          level: 1,
          cost_center_code: 'CC004',
          budget: 8000000.00,
          head_employee_id: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Operations & Manufacturing',
          code: 'OPS',
          description: 'Manufacturing operations and production',
          level: 1,
          cost_center_code: 'CC005',
          budget: 12000000.00,
          head_employee_id: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          parent_id: null,
          name: 'Sales & Marketing',
          code: 'SALES',
          description: 'Sales, marketing, and customer relations',
          level: 1,
          cost_center_code: 'CC006',
          budget: 3000000.00,
          head_employee_id: null,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      departments.push(...orgDepartments);
    }

    for (const dept of departments) {
      await queryRunner.query(
        `INSERT INTO departments (id, organization_id, parent_id, name, code, description, level, cost_center_code, budget, head_employee_id, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [dept.id, dept.organization_id, dept.parent_id, dept.name, dept.code, dept.description, dept.level, dept.cost_center_code, dept.budget, dept.head_employee_id, dept.is_active, dept.created_at, dept.updated_at]
      );
    }

    return departments;
  }

  private static async seedPositions(queryRunner: any, organizations: any[], departments: any[]): Promise<any[]> {
    const positions = [];

    for (const org of organizations) {
      const orgDepartments = departments.filter(d => d.organization_id === org.id);
      
      const orgPositions = [
        // Executive Management Positions
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'EXEC')?.id,
          title: 'Chief Executive Officer',
          code: 'CEO',
          level: 'c_level',
          category: 'management',
          description: 'Chief Executive Officer responsible for overall company strategy and operations',
          requirements: JSON.stringify({
            experience: '15+ years',
            education: 'MBA or equivalent',
            skills: ['Strategic Planning', 'Leadership', 'Business Development']
          }),
          responsibilities: JSON.stringify({
            primary: ['Strategic Direction', 'Board Reporting', 'Stakeholder Management'],
            secondary: ['Team Leadership', 'Business Growth', 'Risk Management']
          }),
          skills_required: JSON.stringify(['Leadership', 'Strategic Thinking', 'Communication']),
          salary_range: JSON.stringify({ min: 5000000, max: 8000000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'EXEC')?.id,
          title: 'Chief Technology Officer',
          code: 'CTO',
          level: 'c_level',
          category: 'technical',
          description: 'Chief Technology Officer responsible for technology strategy and innovation',
          requirements: JSON.stringify({
            experience: '12+ years',
            education: 'B.Tech/M.Tech in Engineering',
            skills: ['Technology Strategy', 'Innovation Management', 'Team Leadership']
          }),
          responsibilities: JSON.stringify({
            primary: ['Technology Vision', 'R&D Strategy', 'Technical Leadership'],
            secondary: ['Innovation Programs', 'Technical Standards', 'Technology Partnerships']
          }),
          skills_required: JSON.stringify(['Technology Leadership', 'Innovation', 'Strategic Planning']),
          salary_range: JSON.stringify({ min: 4000000, max: 6000000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        // HR Positions
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'HR')?.id,
          title: 'Head of Human Resources',
          code: 'HR-HEAD',
          level: 'director',
          category: 'hr',
          description: 'Head of HR responsible for overall HR strategy and operations',
          requirements: JSON.stringify({
            experience: '10+ years in HR',
            education: 'MBA in HR or related field',
            skills: ['HR Strategy', 'Talent Management', 'Employment Law']
          }),
          responsibilities: JSON.stringify({
            primary: ['HR Strategy', 'Talent Acquisition', 'Employee Relations'],
            secondary: ['Compensation Planning', 'Training & Development', 'HR Analytics']
          }),
          skills_required: JSON.stringify(['HR Management', 'Leadership', 'Strategic Planning']),
          salary_range: JSON.stringify({ min: 2500000, max: 4000000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'HR')?.id,
          title: 'HR Manager',
          code: 'HR-MGR',
          level: 'manager',
          category: 'hr',
          description: 'HR Manager for day-to-day HR operations and employee support',
          requirements: JSON.stringify({
            experience: '5-8 years in HR',
            education: 'Bachelor\'s degree in HR or related field',
            skills: ['Employee Relations', 'Recruitment', 'Performance Management']
          }),
          responsibilities: JSON.stringify({
            primary: ['Employee Relations', 'Recruitment Support', 'HR Operations'],
            secondary: ['Policy Implementation', 'Training Coordination', 'HR Reporting']
          }),
          skills_required: JSON.stringify(['HR Operations', 'Communication', 'Problem Solving']),
          salary_range: JSON.stringify({ min: 800000, max: 1500000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        // Engineering Positions
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          title: 'Engineering Manager',
          code: 'ENG-MGR',
          level: 'manager',
          category: 'technical',
          description: 'Engineering Manager responsible for engineering team and project delivery',
          requirements: JSON.stringify({
            experience: '8+ years in engineering',
            education: 'B.Tech/M.Tech in Engineering',
            skills: ['Team Management', 'Technical Leadership', 'Project Management']
          }),
          responsibilities: JSON.stringify({
            primary: ['Team Leadership', 'Project Delivery', 'Technical Strategy'],
            secondary: ['Resource Planning', 'Quality Assurance', 'Performance Management']
          }),
          skills_required: JSON.stringify(['Engineering Management', 'Leadership', 'Technical Skills']),
          salary_range: JSON.stringify({ min: 2000000, max: 3500000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          title: 'Senior Software Engineer',
          code: 'SR-SWE',
          level: 'senior',
          category: 'technical',
          description: 'Senior Software Engineer for complex system development and mentoring',
          requirements: JSON.stringify({
            experience: '5+ years in software development',
            education: 'B.Tech/M.Tech in Computer Science or related',
            skills: ['Full Stack Development', 'System Design', 'Mentoring']
          }),
          responsibilities: JSON.stringify({
            primary: ['Software Development', 'System Architecture', 'Code Review'],
            secondary: ['Mentoring Junior Engineers', 'Technical Documentation', 'Process Improvement']
          }),
          skills_required: JSON.stringify(['Programming', 'System Design', 'Problem Solving']),
          salary_range: JSON.stringify({ min: 1200000, max: 2000000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          organization_id: org.id,
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          title: 'Software Engineer',
          code: 'SWE',
          level: 'mid',
          category: 'technical',
          description: 'Software Engineer for application development and maintenance',
          requirements: JSON.stringify({
            experience: '2-5 years in software development',
            education: 'B.Tech in Computer Science or related',
            skills: ['Programming', 'Database Management', 'Testing']
          }),
          responsibilities: JSON.stringify({
            primary: ['Feature Development', 'Bug Fixing', 'Code Testing'],
            secondary: ['Documentation', 'Code Reviews', 'Learning New Technologies']
          }),
          skills_required: JSON.stringify(['Programming', 'Database Skills', 'Testing']),
          salary_range: JSON.stringify({ min: 600000, max: 1200000, currency: 'INR' }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      positions.push(...orgPositions);
    }

    for (const position of positions) {
      await queryRunner.query(
        `INSERT INTO positions (id, organization_id, department_id, title, code, level, category, description, requirements, responsibilities, skills_required, salary_range, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [position.id, position.organization_id, position.department_id, position.title, position.code, position.level, position.category, position.description, position.requirements, position.responsibilities, position.skills_required, position.salary_range, position.is_active, position.created_at, position.updated_at]
      );
    }

    return positions;
  }

  private static async seedEmployees(queryRunner: any, organizations: any[], departments: any[], positions: any[]): Promise<any[]> {
    const employees = [];

    for (const org of organizations) {
      const orgDepartments = departments.filter(d => d.organization_id === org.id);
      const orgPositions = positions.filter(p => p.organization_id === org.id);
      
      const orgEmployees = [
        // CEO
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024001`,
          first_name: 'Rajesh',
          last_name: 'Kumar',
          middle_name: 'Singh',
          email: `rajesh.kumar@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543210',
          date_of_birth: new Date('1975-03-15'),
          gender: 'male',
          address: JSON.stringify({
            street: '789 Executive Villa',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400050',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Priya Kumar',
            relationship: 'Spouse',
            phone: '+91-9876543211'
          }),
          personal_documents: JSON.stringify({
            pan: 'ABCDE1234F',
            aadhar: '1234-5678-9012',
            passport: 'A1234567'
          }),
          department_id: orgDepartments.find(d => d.code === 'EXEC')?.id,
          position_id: orgPositions.find(p => p.code === 'CEO')?.id,
          manager_id: null,
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2020-01-15'),
          probation_end_date: new Date('2020-07-15'),
          termination_date: null,
          work_location: 'office',
          salary_grade: 'E1',
          current_salary: 6000000.00,
          skills: JSON.stringify(['Strategic Leadership', 'Business Development', 'Team Management']),
          certifications: JSON.stringify([
            { name: 'Executive Leadership Certificate', issuer: 'IIM Mumbai', date: '2019-12-01' }
          ]),
          performance_rating: 4.8,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // CTO
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024002`,
          first_name: 'Priya',
          last_name: 'Sharma',
          middle_name: null,
          email: `priya.sharma@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543220',
          date_of_birth: new Date('1980-07-22'),
          gender: 'female',
          address: JSON.stringify({
            street: '456 Tech Heights',
            city: 'Pune',
            state: 'Maharashtra',
            pincode: '411001',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Amit Sharma',
            relationship: 'Spouse',
            phone: '+91-9876543221'
          }),
          personal_documents: JSON.stringify({
            pan: 'FGHIJ5678K',
            aadhar: '5678-9012-3456',
            passport: 'B5678901'
          }),
          department_id: orgDepartments.find(d => d.code === 'EXEC')?.id,
          position_id: orgPositions.find(p => p.code === 'CTO')?.id,
          manager_id: null, // Will be set to CEO later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2020-03-01'),
          probation_end_date: new Date('2020-09-01'),
          termination_date: null,
          work_location: 'hybrid',
          salary_grade: 'E2',
          current_salary: 5000000.00,
          skills: JSON.stringify(['Technology Strategy', 'Innovation Management', 'Team Leadership']),
          certifications: JSON.stringify([
            { name: 'Certified Technology Executive', issuer: 'IEEE', date: '2021-06-15' },
            { name: 'Digital Transformation Leader', issuer: 'MIT', date: '2022-01-20' }
          ]),
          performance_rating: 4.7,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // HR Head
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024003`,
          first_name: 'Anita',
          last_name: 'Desai',
          middle_name: 'Rani',
          email: `anita.desai@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543230',
          date_of_birth: new Date('1985-11-10'),
          gender: 'female',
          address: JSON.stringify({
            street: '321 HR Plaza',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400020',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Vikram Desai',
            relationship: 'Spouse',
            phone: '+91-9876543231'
          }),
          personal_documents: JSON.stringify({
            pan: 'LMNOP9012Q',
            aadhar: '9012-3456-7890',
            passport: null
          }),
          department_id: orgDepartments.find(d => d.code === 'HR')?.id,
          position_id: orgPositions.find(p => p.code === 'HR-HEAD')?.id,
          manager_id: null, // Will be set to CEO later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2021-06-01'),
          probation_end_date: new Date('2021-12-01'),
          termination_date: null,
          work_location: 'office',
          salary_grade: 'M1',
          current_salary: 3200000.00,
          skills: JSON.stringify(['HR Strategy', 'Talent Management', 'Employee Relations']),
          certifications: JSON.stringify([
            { name: 'SHRM-CP', issuer: 'SHRM', date: '2020-05-01' },
            { name: 'HR Analytics Certificate', issuer: 'XLRI', date: '2021-03-15' }
          ]),
          performance_rating: 4.5,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // HR Manager
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024004`,
          first_name: 'Rohit',
          last_name: 'Patel',
          middle_name: null,
          email: `rohit.patel@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543240',
          date_of_birth: new Date('1990-05-18'),
          gender: 'male',
          address: JSON.stringify({
            street: '654 HR Colony',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400030',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Neha Patel',
            relationship: 'Spouse',
            phone: '+91-9876543241'
          }),
          personal_documents: JSON.stringify({
            pan: 'RSTUV3456W',
            aadhar: '3456-7890-1234',
            passport: 'C3456789'
          }),
          department_id: orgDepartments.find(d => d.code === 'HR')?.id,
          position_id: orgPositions.find(p => p.code === 'HR-MGR')?.id,
          manager_id: null, // Will be set to HR Head later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2022-01-15'),
          probation_end_date: new Date('2022-07-15'),
          termination_date: null,
          work_location: 'office',
          salary_grade: 'M2',
          current_salary: 1200000.00,
          skills: JSON.stringify(['Employee Relations', 'Recruitment', 'Performance Management']),
          certifications: JSON.stringify([
            { name: 'HR Generalist Certificate', issuer: 'TISS', date: '2021-11-01' }
          ]),
          performance_rating: 4.2,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // Engineering Manager
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024005`,
          first_name: 'Suresh',
          last_name: 'Reddy',
          middle_name: 'Kumar',
          email: `suresh.reddy@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543250',
          date_of_birth: new Date('1982-09-05'),
          gender: 'male',
          address: JSON.stringify({
            street: '987 Tech Park',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Lakshmi Reddy',
            relationship: 'Spouse',
            phone: '+91-9876543251'
          }),
          personal_documents: JSON.stringify({
            pan: 'WXYZAB7890C',
            aadhar: '7890-1234-5678',
            passport: 'D7890123'
          }),
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          position_id: orgPositions.find(p => p.code === 'ENG-MGR')?.id,
          manager_id: null, // Will be set to CTO later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2020-08-01'),
          probation_end_date: new Date('2021-02-01'),
          termination_date: null,
          work_location: 'hybrid',
          salary_grade: 'M3',
          current_salary: 2800000.00,
          skills: JSON.stringify(['Engineering Management', 'Team Leadership', 'Technical Strategy']),
          certifications: JSON.stringify([
            { name: 'PMP Certification', issuer: 'PMI', date: '2019-08-15' },
            { name: 'Engineering Leadership', issuer: 'IIT Bombay', date: '2021-12-01' }
          ]),
          performance_rating: 4.6,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // Senior Software Engineers
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024006`,
          first_name: 'Kavya',
          last_name: 'Nair',
          middle_name: null,
          email: `kavya.nair@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543260',
          date_of_birth: new Date('1988-12-25'),
          gender: 'female',
          address: JSON.stringify({
            street: '147 Software City',
            city: 'Chennai',
            state: 'Tamil Nadu',
            pincode: '600001',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Ravi Nair',
            relationship: 'Spouse',
            phone: '+91-9876543261'
          }),
          personal_documents: JSON.stringify({
            pan: 'DEFGHI4567J',
            aadhar: '4567-8901-2345',
            passport: null
          }),
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          position_id: orgPositions.find(p => p.code === 'SR-SWE')?.id,
          manager_id: null, // Will be set to Engineering Manager later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2021-03-15'),
          probation_end_date: new Date('2021-09-15'),
          termination_date: null,
          work_location: 'remote',
          salary_grade: 'S1',
          current_salary: 1600000.00,
          skills: JSON.stringify(['Full Stack Development', 'System Design', 'Mentoring']),
          certifications: JSON.stringify([
            { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021-01-15' },
            { name: 'React Advanced Developer', issuer: 'Meta', date: '2022-06-01' }
          ]),
          performance_rating: 4.4,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        },
        // Software Engineers
        {
          id: uuidv4(),
          organization_id: org.id,
          employee_number: `${org.code}2024007`,
          first_name: 'Amit',
          last_name: 'Gupta',
          middle_name: 'Kumar',
          email: `amit.gupta@${org.code.toLowerCase()}.com`,
          phone: '+91-9876543270',
          date_of_birth: new Date('1995-04-08'),
          gender: 'male',
          address: JSON.stringify({
            street: '258 Developer Street',
            city: 'Noida',
            state: 'Uttar Pradesh',
            pincode: '201301',
            country: 'India'
          }),
          emergency_contact: JSON.stringify({
            name: 'Sunita Gupta',
            relationship: 'Mother',
            phone: '+91-9876543271'
          }),
          personal_documents: JSON.stringify({
            pan: 'KLMNOP8901R',
            aadhar: '8901-2345-6789',
            passport: 'E8901234'
          }),
          department_id: orgDepartments.find(d => d.code === 'ENG')?.id,
          position_id: orgPositions.find(p => p.code === 'SWE')?.id,
          manager_id: null, // Will be set to Senior Software Engineer later
          employment_type: 'full_time',
          employment_status: 'active',
          hire_date: new Date('2023-07-01'),
          probation_end_date: new Date('2024-01-01'),
          termination_date: null,
          work_location: 'office',
          salary_grade: 'J1',
          current_salary: 900000.00,
          skills: JSON.stringify(['JavaScript', 'Node.js', 'Database Management']),
          certifications: JSON.stringify([
            { name: 'Node.js Developer', issuer: 'Node.js Foundation', date: '2023-05-01' }
          ]),
          performance_rating: 4.0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: null,
          updated_by: null
        }
      ];

      employees.push(...orgEmployees);
    }

    for (const employee of employees) {
      await queryRunner.query(
        `INSERT INTO employees (id, organization_id, employee_number, first_name, last_name, middle_name, email, phone, date_of_birth, gender, address, emergency_contact, personal_documents, department_id, position_id, manager_id, employment_type, employment_status, hire_date, probation_end_date, termination_date, work_location, salary_grade, current_salary, skills, certifications, performance_rating, is_active, created_at, updated_at, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)`,
        [employee.id, employee.organization_id, employee.employee_number, employee.first_name, employee.last_name, employee.middle_name, employee.email, employee.phone, employee.date_of_birth, employee.gender, employee.address, employee.emergency_contact, employee.personal_documents, employee.department_id, employee.position_id, employee.manager_id, employee.employment_type, employee.employment_status, employee.hire_date, employee.probation_end_date, employee.termination_date, employee.work_location, employee.salary_grade, employee.current_salary, employee.skills, employee.certifications, employee.performance_rating, employee.is_active, employee.created_at, employee.updated_at, employee.created_by, employee.updated_by]
      );
    }

    return employees;
  }

  private static async updateDepartmentHeads(queryRunner: any, departments: any[], employees: any[]): Promise<void> {
    // Update manager relationships and department heads
    const updates = [];

    for (const dept of departments) {
      const orgEmployees = employees.filter(e => e.organization_id === dept.organization_id);
      
      // Set department heads
      if (dept.code === 'EXEC') {
        const ceo = orgEmployees.find(e => e.employee_number.endsWith('001'));
        if (ceo) {
          updates.push({ 
            table: 'departments', 
            id: dept.id, 
            field: 'head_employee_id', 
            value: ceo.id 
          });
        }
      } else if (dept.code === 'HR') {
        const hrHead = orgEmployees.find(e => e.employee_number.endsWith('003'));
        if (hrHead) {
          updates.push({ 
            table: 'departments', 
            id: dept.id, 
            field: 'head_employee_id', 
            value: hrHead.id 
          });
        }
      } else if (dept.code === 'ENG') {
        const engMgr = orgEmployees.find(e => e.employee_number.endsWith('005'));
        if (engMgr) {
          updates.push({ 
            table: 'departments', 
            id: dept.id, 
            field: 'head_employee_id', 
            value: engMgr.id 
          });
        }
      }
    }

    // Set manager relationships
    for (const emp of employees) {
      if (emp.employee_number.endsWith('002')) { // CTO reports to CEO
        const ceo = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('001'));
        if (ceo) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: ceo.id 
          });
        }
      } else if (emp.employee_number.endsWith('003')) { // HR Head reports to CEO
        const ceo = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('001'));
        if (ceo) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: ceo.id 
          });
        }
      } else if (emp.employee_number.endsWith('004')) { // HR Manager reports to HR Head
        const hrHead = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('003'));
        if (hrHead) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: hrHead.id 
          });
        }
      } else if (emp.employee_number.endsWith('005')) { // Engineering Manager reports to CTO
        const cto = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('002'));
        if (cto) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: cto.id 
          });
        }
      } else if (emp.employee_number.endsWith('006')) { // Senior Engineer reports to Engineering Manager
        const engMgr = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('005'));
        if (engMgr) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: engMgr.id 
          });
        }
      } else if (emp.employee_number.endsWith('007')) { // Software Engineer reports to Senior Engineer
        const seniorEng = employees.find(e => e.organization_id === emp.organization_id && e.employee_number.endsWith('006'));
        if (seniorEng) {
          updates.push({ 
            table: 'employees', 
            id: emp.id, 
            field: 'manager_id', 
            value: seniorEng.id 
          });
        }
      }
    }

    // Apply updates
    for (const update of updates) {
      await queryRunner.query(
        `UPDATE ${update.table} SET ${update.field} = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [update.value, update.id]
      );
    }
  }
}
