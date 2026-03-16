// Simple test to verify the manufacturing module can be imported
import { Test, TestingModule } from '@nestjs/testing';
import { ManufacturingModule } from './src/manufacturing.module';

async function testModule() {
  try {
    console.log('🧪 Testing Manufacturing Module Import...');
    
    // Test if the module can be imported without errors
    const moduleRef = await Test.createTestingModule({
      imports: [ManufacturingModule],
    }).compile();

    console.log('✅ Manufacturing Module imported successfully!');
    console.log('📦 Module compiled and ready!');
    
    await moduleRef.close();
    console.log('🏁 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Module test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testModule();