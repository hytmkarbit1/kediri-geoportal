import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Testing .env configuration...\n');

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url) {
    console.log('❌ VITE_SUPABASE_URL is NOT set');
    console.log('   Check that your .env file exists and contains:');
    console.log('   VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co\n');
} else {
    console.log('✅ VITE_SUPABASE_URL is set');
    console.log('   Value:', url);

    // Validate URL format
    if (!url.startsWith('https://')) {
        console.log('   ⚠️  URL should start with https://');
    }
    if (!url.includes('supabase.co')) {
        console.log('   ⚠️  URL should contain supabase.co');
    }
    console.log();
}

if (!key) {
    console.log('❌ VITE_SUPABASE_ANON_KEY is NOT set');
    console.log('   Check that your .env file contains:');
    console.log('   VITE_SUPABASE_ANON_KEY=<your-key-here>\n');
} else {
    console.log('✅ VITE_SUPABASE_ANON_KEY is set');
    console.log('   Length:', key.length, 'characters');
    console.log('   First 50 chars:', key.substring(0, 50) + '...');

    // Validate key format (JWT tokens start with eyJ)
    if (!key.startsWith('eyJ')) {
        console.log('   ⚠️  Key should start with "eyJ" (JWT token format)');
    }
    console.log();
}

console.log('─'.repeat(60));

if (url && key) {
    console.log('🎉 Configuration looks good!');
    console.log('\nYou can now run:');
    console.log('   node scripts/import-to-supabase.js');
} else {
    console.log('⚠️  Configuration has issues');
    console.log('\nPlease check:');
    console.log('1. .env file exists in project root');
    console.log('2. File contains both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('3. No spaces around = signs');
    console.log('4. No quotes around values');
    console.log('\nSee VERIFY_ENV_FILE.md for detailed instructions');
}

console.log('─'.repeat(60));
