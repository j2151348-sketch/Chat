const SUPABASE_URL = 'https://ozrscduqrxuccdbwglqr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cnNjZHVxcnh1Y2NkYndnbHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzI1MDMsImV4cCI6MjA3NjU0ODUwM30.IaUnk0sV79xS4i23iODU5ylSmoL7L5t94m70bG1eKyc';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Login / Signup
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authMsg = document.getElementById('auth-msg');
if(document.getElementById('btnSignup')){
  document.getElementById('btnSignup').addEventListener('click', async()=>{
    const email=emailInput.value,password=passwordInput.value;
    const {data,error}=await supabase.auth.signUp({email,password});
    if(error) authMsg.innerText=error.message;
    else authMsg.innerText='Compte créé ! Attendez l\'approbation de l\'admin.';
  });
}
if(document.getElementById('btnLogin')){
  document.getElementById('btnLogin').addEventListener('click', async()=>{
    const email=emailInput.value,password=passwordInput.value;
    const {data,error}=await supabase.auth.signInWithPassword({email,password});
    if(error) authMsg.innerText=error.message;
    else window.location.href='waiting.html';
  });
}
