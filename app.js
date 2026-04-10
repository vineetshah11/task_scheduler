// TaskBridge Frontend Logic

const taskForm = document.getElementById('task-form');
const statusMsg = document.getElementById('status-message');
const submitBtn = document.getElementById('submit-btn');

// --- SETUP CONFIGURATION ---
const SUPABASE_URL = 'https://yqjhazasbxjjbzmdphmq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxamhhemFzYnhqamJ6bWRwaG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzA2MDcsImV4cCI6MjA5MTQwNjYwN30.UUA5168dnTNKFK3qStFLKoO1YZAo7EFtWxhIyuwEl3g';
const FAMILY_KEY = '1103';

let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function showStatus(message, isError = false) {
    statusMsg.innerText = message;
    statusMsg.className = isError ? 'error' : 'success';
    statusMsg.classList.remove('hidden');
    
    // Auto-hide after 5 seconds if success
    if (!isError) {
        setTimeout(() => {
            statusMsg.classList.add('hidden');
        }, 5000);
    }
}

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const giver = document.getElementById('username').value;
    const title = document.getElementById('task-title').value;
    const urgency = document.getElementById('urgency').value;
    const deadline = document.getElementById('deadline').value;
    const key = document.getElementById('secret-key').value;

    // 1. Validate Secret Key
    if (key !== FAMILY_KEY) {
        showStatus('Incorrect Secret Password.', true);
        return;
    }

    // 2. Check if Supabase is configured
    if (!supabaseClient) {
        showStatus('Supabase is not configured yet. Setup the .env file or local keys.', true);
        console.error('Supabase Client not initialized. SB_URL and SB_KEY missing in localStorage.');
        return;
    }

    // 3. Submit Task
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').innerText = 'Syncing...';

    try {
        const { data, error } = await supabaseClient
            .from('tasks')
            .insert([
                { 
                    giver: giver, 
                    title: title, 
                    urgency: urgency, 
                    deadline: deadline,
                    status: 'pending',
                    created_at: new Date().toISOString()
                }
            ]);

        if (error) throw error;

        showStatus(`🚀 Pushed to Vineet! He will be alerted.`, false);
        
        // Add a small shake/pulse to the card on success
        document.querySelector('.form-card').animate([
            { transform: 'scale(1)' },
            { transform: 'scale(1.02)' },
            { transform: 'scale(1)' }
        ], { duration: 500 });

        taskForm.reset();
    } catch (err) {
        console.error('Submission Error:', err);
        showStatus(`Error: ${err.message}`, true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').innerText = 'Push to Reminders';
    }
});

// Helper for setup (call this from console if needed)
window.setupTaskBridge = (url, key, familyKey) => {
    localStorage.setItem('SB_URL', url);
    localStorage.setItem('SB_KEY', key);
    localStorage.setItem('FAMILY_KEY', familyKey);
    location.reload();
};
