// Quick test script to verify Formspree endpoints
const contactEndpoint = 'https://formspree.io/f/xvglkroe';
const bookingEndpoint = 'https://formspree.io/f/xpwbpdee';

async function testEndpoint(name, endpoint) {
  console.log(`\nTesting ${name} endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _test: true,
        email: 'test@example.com',
        message: 'Test message from NECHABEST'
      }),
    });

    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log(`✅ ${name} endpoint is working!`);
    } else {
      console.log(`❌ ${name} endpoint returned error`);
    }
  } catch (error) {
    console.log(`❌ ${name} endpoint failed:`, error.message);
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('FORMSPREE ENDPOINT TEST');
  console.log('='.repeat(60));
  
  await testEndpoint('Contact', contactEndpoint);
  await testEndpoint('Booking', bookingEndpoint);
  
  console.log('\n' + '='.repeat(60));
  console.log('TEST COMPLETE');
  console.log('='.repeat(60));
}

runTests();
