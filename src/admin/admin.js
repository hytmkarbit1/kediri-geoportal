import { supabase } from '../config/supabase.js';
import { getCurrentUser, isAdmin } from '../config/supabase.js'; // Need to export isAdmin from config or auth

// Import isAdmin from auth.js if not available in config
// Actually, let's check auth.js first.
// I'll assume I can import it from '../auth/auth.js' or implement it here.

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check if already logged in
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        await checkAdminAccess(user);
    } else {
        showLogin();
    }

    setupTabs();
    setupEventListeners();
});

async function checkAdminAccess(user) {
    // Check role
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

    if (error || !data || data.role !== 'admin') {
        alert('Access Denied: Admins only');
        await supabase.auth.signOut();
        showLogin();
        return;
    }

    // Access granted
    document.getElementById('admin-email').textContent = user.email;
    document.getElementById('admin-login-container').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'block';
    loadPendingData();
}

function showLogin() {
    document.getElementById('admin-login-container').style.display = 'block';
    document.getElementById('dashboard-content').style.display = 'none';
}

// Login Handler
document.getElementById('admin-login-submit')?.addEventListener('click', async () => {
    const email = document.getElementById('admin-email-input').value;
    const password = document.getElementById('admin-password-input').value;
    const errorMsg = document.getElementById('login-error');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        await checkAdminAccess(data.user);
        errorMsg.style.display = 'none';

    } catch (error) {
        errorMsg.textContent = error.message;
        errorMsg.style.display = 'block';
    }
});

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class
            tab.classList.add('active');
            const contentId = `${tab.dataset.tab}-tab`;
            document.getElementById(contentId).classList.add('active');

            // Load data for tab
            if (tab.dataset.tab === 'pending') loadPendingData();
            if (tab.dataset.tab === 'approved') loadApprovedData();
            if (tab.dataset.tab === 'government') loadGovernmentData();
        });
    });
}

function setupEventListeners() {
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    });

    document.getElementById('refresh-pending').addEventListener('click', loadPendingData);
    document.getElementById('refresh-approved').addEventListener('click', loadApprovedData);
    document.getElementById('refresh-gov').addEventListener('click', loadGovernmentData);
}

// --- Data Loading ---

async function loadPendingData() {
    const tbody = document.querySelector('#pending-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    try {
        // Fetch from all crowd data tables
        const [points, polygons, uploads] = await Promise.all([
            fetchCrowdData('user_points', 'pending'),
            fetchCrowdData('user_polygons', 'pending'),
            fetchCrowdData('uploaded_features', 'pending')
        ]);

        const allData = [...points, ...polygons, ...uploads];

        renderTable(tbody, allData, true);
    } catch (error) {
        console.error('Error loading pending data:', error);
        tbody.innerHTML = `<tr><td colspan="5" class="error">Error: ${error.message}</td></tr>`;
    }
}

async function loadApprovedData() {
    const tbody = document.querySelector('#approved-table tbody');
    tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

    try {
        const [points, polygons, uploads] = await Promise.all([
            fetchCrowdData('user_points', 'approved'),
            fetchCrowdData('user_polygons', 'approved'),
            fetchCrowdData('uploaded_features', 'approved')
        ]);

        const allData = [...points, ...polygons, ...uploads];
        renderTable(tbody, allData, false);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="error">Error: ${error.message}</td></tr>`;
    }
}

async function fetchCrowdData(table, status) {
    const { data, error } = await supabase
        .schema('crowd_data')
        .from(table)
        .select('*, user:user_id(email)') // Assuming user_id links to auth.users but we can't select email directly usually due to security. 
        // Actually, we can't join auth.users easily. We'll just show user ID or fetch emails separately if needed.
        // For now, let's just fetch the data.
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(d => ({ ...d, _table: table }));
}

function renderTable(tbody, data, isPending) {
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6">No ${isPending ? 'pending' : 'approved'} data found</td></tr>`;
        return;
    }

    tbody.innerHTML = data.map(item => {
        // Extract coordinates from geometry
        let coords = null;
        if (item.geom && item.geom.coordinates) {
            if (item.geom.type === 'Point') {
                coords = item.geom.coordinates;
            } else if (item.geom.type === 'Polygon') {
                // Get first coordinate of polygon
                coords = item.geom.coordinates[0][0];
            }
        }

        return `
        <tr id="row-${item.id}">
            <td>${item._table.replace('user_', '').replace('uploaded_', '')}</td>
            <td>${item.feature_name || item.name || 'Unnamed'}</td>
            <td>${item.user_id ? item.user_id.substring(0, 8) + '...' : 'System'}</td>
            <td>${new Date(item.created_at).toLocaleDateString()}</td>
            <td>
                ${coords ? `<button class="btn-view" onclick="window.viewOnMap(${coords[1]}, ${coords[0]}, '${item.feature_name || item.name || 'Feature'}')">📍 View</button>` : 'N/A'}
            </td>
            <td>
                <div class="action-buttons">
                    ${isPending ? `
                        <button class="btn-approve" onclick="window.approveItem(this, '${item.id}', '${item._table}')">Approve</button>
                        <button class="btn-reject" onclick="window.rejectItem(this, '${item.id}', '${item._table}')">Reject</button>
                    ` : ''}
                    <button class="btn-delete" onclick="window.deleteItem(this, '${item.id}', '${item._table}')">Delete</button>
                </div>
            </td>
        </tr>
    `}).join('');
}

// View on Map functionality
window.viewOnMap = (lat, lng, name) => {
    window.open(`/map.html?lat=${lat}&lng=${lng}&zoom=16&name=${encodeURIComponent(name)}`, '_blank');
};

// --- Actions ---

window.approveItem = async (btn, id, table) => {
    if (!confirm('Approve this item?')) return;
    updateStatus(btn, id, table, 'approved');
};

window.rejectItem = async (btn, id, table) => {
    if (!confirm('Reject this item?')) return;
    updateStatus(btn, id, table, 'rejected');
};

window.deleteItem = async (btn, id, table) => {
    if (!confirm('Permanently delete this item?')) return;

    setLoading(btn, true);
    try {
        const { error } = await supabase
            .schema('crowd_data')
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('Item deleted', 'success');

        // Refresh both lists to ensure UI is in sync
        await Promise.all([loadPendingData(), loadApprovedData()]);

    } catch (error) {
        showToast(error.message, 'error');
        setLoading(btn, false);
    }
};

async function updateStatus(btn, id, table, status) {
    setLoading(btn, true);
    try {
        const { error } = await supabase
            .schema('crowd_data')
            .from(table)
            .update({ status })
            .eq('id', id);

        if (error) throw error;

        showToast(`Item ${status}`, 'success');

        // Refresh both lists to ensure UI is in sync
        await Promise.all([loadPendingData(), loadApprovedData()]);

    } catch (error) {
        showToast(error.message, 'error');
        setLoading(btn, false);
    }
}

function setLoading(btn, isLoading) {
    if (isLoading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = '...';
        btn.disabled = true;
        btn.classList.add('loading');
    } else {
        btn.textContent = btn.dataset.originalText;
        btn.disabled = false;
        btn.classList.remove('loading');
    }
}

// --- Government Data ---

async function loadGovernmentData() {
    const tbody = document.querySelector('#gov-table tbody');
    tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';

    const tables = ['admin_boundaries', 'land_cover', 'buildings', 'roads', 'education_points', 'commercial_points'];
    const stats = [];

    try {
        for (const table of tables) {
            const { count, error } = await supabase
                .schema('government_data')
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                stats.push({ table, count });
            }
        }

        tbody.innerHTML = stats.map(s => `
            <tr>
                <td>${s.table}</td>
                <td>${s.count} records</td>
                <td>
                    <button class="btn-delete" disabled title="Not implemented yet">Delete All</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" class="error">Error: ${error.message}</td></tr>`;
    }
}

// --- Toast Helper ---
function showToast(message, type = 'info') {
    const toast = document.getElementById('message-toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}
