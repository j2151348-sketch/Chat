document.addEventListener('DOMContentLoaded', async () => {
  // Supabase
  const SUPABASE_URL = 'https://ozrscduqrxuccdbwglqr.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96cnNjZHVxcnh1Y2NkYndnbHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzI1MDMsImV4cCI6MjA3NjU0ODUwM30.IaUnk0sV79xS4i23iODU5ylSmoL7L5t94m70bG1eKyc';
  const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Inputs
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const authMsg = document.getElementById('auth-msg');

  // SIGNUP
  const btnSignup = document.getElementById('btnSignup');
  if(btnSignup){
    btnSignup.addEventListener('click', async()=>{
      const email=emailInput.value.trim();
      const password=passwordInput.value.trim();
      if(!email || !password){ authMsg.innerText='Email et mot de passe requis'; return; }

      const {data:user,error}=await supabase.auth.signUp({email,password});
      if(error){ authMsg.innerText=error.message; return; }

      // Créer le profil
      const {error:profileError} = await supabase.from('profiles').insert([{
        id: user.user.id,
        email: email,
        username: email.split('@')[0],
        approved: false
      }]);
      if(profileError){ authMsg.innerText=profileError.message; return; }

      authMsg.innerText='Compte créé ! Attendez l\'approbation de l\'admin.';
    });
  }

  // LOGIN
  const btnLogin = document.getElementById('btnLogin');
  if(btnLogin){
    btnLogin.addEventListener('click', async()=>{
      const email=emailInput.value.trim();
      const password=passwordInput.value.trim();
      if(!email || !password){ authMsg.innerText='Email et mot de passe requis'; return; }

      const {data:user,error}=await supabase.auth.signInWithPassword({email,password});
      if(error){ authMsg.innerText=error.message; return; }

      // Vérifier approbation
      const {data:profile,error:profError} = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();
      if(profError){ authMsg.innerText=profError.message; return; }

      if(!profile.approved) window.location.href='waiting.html';
      else window.location.href='chat.html';
    });
  }

  // --- CHAT LOGIQUE ---
  const msgInput = document.getElementById('msg-input');
  const fileInput = document.getElementById('file-input');
  const sendBtn = document.getElementById('send-btn');
  const messagesDiv = document.getElementById('messages');

  if(sendBtn){
    sendBtn.addEventListener('click', async()=>{
      let fileUrl = null;
      if(fileInput.files.length>0){
        const file = fileInput.files[0];
        const {data:uploadData,error:uploadError} = await supabase.storage
          .from('uploads')
          .upload(`${Date.now()}_${file.name}`, file, {upsert:true});
        if(uploadError){ alert(uploadError.message); return; }
        const {data:publicUrl} = supabase.storage.from('uploads').getPublicUrl(uploadData.path);
        fileUrl = publicUrl.publicUrl;
      }

      const userId = (await supabase.auth.getUser()).data.user.id;

      await supabase.from('messages').insert([{
        user_id: userId,
        content: msgInput.value || null,
        file_url: fileUrl
      }]);
      msgInput.value=''; fileInput.value='';
      loadMessages();
    });

    async function loadMessages(){
      const {data} = await supabase.from('messages').select('*').order('created_at',{ascending:true});
      messagesDiv.innerHTML='';
      data.forEach(m=>{
        const div = document.createElement('div');
        div.innerText = (m.content||'') + (m.file_url ? ` [Fichier: ${m.file_url}]` : '');
        messagesDiv.appendChild(div);
      });
    }

    loadMessages();

    // Temps réel
    supabase.from('messages').on('INSERT', payload=>{
      loadMessages();
    }).subscribe();
  }
});
