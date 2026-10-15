// End-to-End Test Suite for Brew & Bloom Authentication Engine

async function runAuthTests() {
  const BASE_URL = 'http://localhost:4000/api/auth';
  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      console.log(`  ✓ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ✗ [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  console.log('\n======================================================');
  console.log('🧪 Starting Brew & Bloom End-to-End Auth Test Suite');
  console.log('======================================================\n');

  // Test 1: Log in with seeded demo user
  console.log('1. Testing Demo User Login...');
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'aarav@brewbloom.coffee', password: 'coffee123' })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Demo login returns HTTP 200');
  assert(loginData.success === true, 'Demo login response has success: true');
  assert(!!loginData.token, 'Demo login returns JWT session token');
  assert(loginData.user?.email === 'aarav@brewbloom.coffee', 'Demo login returns correct user record');
  const demoToken = loginData.token;

  // Test 2: Session persistence on refresh (/me)
  console.log('\n2. Testing Session Persistence on Refresh (/me)...');
  const meRes = await fetch(`${BASE_URL}/me`, {
    headers: { 'Authorization': `Bearer ${demoToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'GET /me returns HTTP 200');
  assert(meData.success === true, 'GET /me returns success: true');
  assert(meData.user?.id === 'usr_aarav', 'GET /me preserves user ID across sessions');
  assert(typeof meData.user?.activeVouchersCount === 'number', 'GET /me includes active vouchers count');

  // Test 3: Wrong password rejection
  console.log('\n3. Testing Wrong Password Rejection...');
  const wrongPassRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'aarav@brewbloom.coffee', password: 'completelyWrongPassword!' })
  });
  const wrongPassData = await wrongPassRes.json();
  assert(wrongPassRes.status === 401, 'Wrong password returns HTTP 401');
  assert(wrongPassData.success === false, 'Wrong password has success: false');
  assert(wrongPassData.error?.code === 'WRONG_PASSWORD', 'Error code is WRONG_PASSWORD');

  // Test 4: New User Sign Up
  console.log('\n4. Testing New User Sign Up...');
  const testEmail = `coffee_explorer_${Date.now()}@example.com`;
  const signupRes = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Maya Lin',
      email: testEmail,
      password: 'mypassword123',
      phone: `+91${Math.floor(9000000000 + Math.random() * 999999999)}`
    })
  });
  const signupData = await signupRes.json();
  assert(signupRes.status === 201, 'Sign up returns HTTP 201 Created');
  assert(signupData.success === true, 'Sign up response has success: true');
  assert(!!signupData.token, 'Sign up returns session token');
  assert(signupData.newVoucherAssigned === true, 'Sign up auto-issues welcome vouchers');
  const newUserToken = signupData.token;

  // Test 5: Verify new user session works on refresh
  console.log('\n5. Testing New User Session (/me)...');
  const newMeRes = await fetch(`${BASE_URL}/me`, {
    headers: { 'Authorization': `Bearer ${newUserToken}` }
  });
  const newMeData = await newMeRes.json();
  assert(newMeRes.status === 200, 'New user session verified via /me');
  assert(newMeData.user?.email === testEmail, 'New user profile matches registration');

  // Test 6: Forgot and Reset Password Flow
  console.log('\n6. Testing Forgot & Reset Password Flow...');
  const forgotRes = await fetch(`${BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail })
  });
  const forgotData = await forgotRes.json();
  assert(forgotRes.status === 200, 'Forgot password returns HTTP 200');
  assert(!!forgotData.devResetCode, 'Returns active reset code');
  const resetCode = forgotData.devResetCode;

  // Reset password
  const resetRes = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: testEmail,
      resetCode: resetCode,
      newPassword: 'brandNewPassword2026'
    })
  });
  const resetData = await resetRes.json();
  assert(resetRes.status === 200, 'Reset password returns HTTP 200');
  assert(resetData.success === true, 'Password successfully reset');

  // Verify old password fails
  const oldLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, password: 'mypassword123' })
  });
  assert(oldLoginRes.status === 401, 'Old password rejected after reset');

  // Verify new password succeeds
  const newLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: testEmail, password: 'brandNewPassword2026' })
  });
  assert(newLoginRes.status === 200, 'New password login succeeds');

  // Test 7: Protected Route Rejection without Token
  console.log('\n7. Testing Protected Route Rejection...');
  const unauthRes = await fetch(`${BASE_URL}/me`, {
    headers: { 'Authorization': '' }
  });
  assert(unauthRes.status === 401, 'Unauthenticated request to protected route returns HTTP 401');

  // Test 8: Logout
  console.log('\n8. Testing Logout...');
  const logoutRes = await fetch(`${BASE_URL}/logout`, {
    method: 'POST'
  });
  assert(logoutRes.status === 200, 'Logout returns HTTP 200');

  // Test 9: Phone OTP Flow (Seamless Login)
  console.log('\n9. Testing Phone OTP Sign-in Flow...');
  const otpSendRes = await fetch(`${BASE_URL}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', isDemo: true })
  });
  const otpSendData = await otpSendRes.json();
  assert(otpSendRes.status === 200, 'OTP request returns HTTP 200');
  assert(!!otpSendData.devOtp, 'Returns generated OTP code');

  const otpVerifyRes = await fetch(`${BASE_URL}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', otp: otpSendData.devOtp })
  });
  const otpVerifyData = await otpVerifyRes.json();
  assert(otpVerifyRes.status === 200, 'OTP verification returns HTTP 200');
  assert(otpVerifyData.success === true, 'OTP verification success');
  assert(!!otpVerifyData.token, 'OTP verification returns JWT');

  console.log('\n======================================================');
  console.log(`🎉 ALL ${passedCount}/${totalCount} AUTH FLOW TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================\n');
}

runAuthTests().catch(err => {
  console.error('\n❌ E2E Auth Test Suite Failed:', err);
  process.exit(1);
});
