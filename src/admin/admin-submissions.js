// Admin Submissions Management Module
import { supabase } from '../config/supabase.js';
import { isAdmin } from '../config/supabase.js';

// Load pending submissions
export async function loadPendingSubmissions() {
    try {
        const admin = await isAdmin();
        if (!admin) {
            console.error('User is not an admin');
            return [];
        }

        const { data, error } = await supabase
            .from('crowd_submissions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading pending submissions:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error loading pending submissions:', error);
        return [];
    }
}

// Approve a submission
export async function approveSubmission(submissionId, moveToOfficial = false) {
    try {
        const admin = await isAdmin();
        if (!admin) {
            throw new Error('Unauthorized: Admin access required');
        }

        if (moveToOfficial) {
            // Get the submission
            const { data: submission, error: fetchError } = await supabase
                .from('crowd_submissions')
                .select('*')
                .eq('id', submissionId)
                .single();

            if (fetchError) throw fetchError;

            // Move to official_data
            const { error: insertError } = await supabase
                .from('official_data')
                .insert({
                    layer_name: submission.layer_name || 'crowd_approved',
                    properties: submission.properties,
                    geom: submission.geom
                });

            if (insertError) throw insertError;

            // Update status to approved
            const { error: updateError } = await supabase
                .from('crowd_submissions')
                .update({ status: 'approved', admin_notes: 'Moved to official data' })
                .eq('id', submissionId);

            if (updateError) throw updateError;
        } else {
            // Just update status to approved
            const { error } = await supabase
                .from('crowd_submissions')
                .update({ status: 'approved' })
                .eq('id', submissionId);

            if (error) throw error;
        }

        console.log(`✅ Submission ${submissionId} approved`);
        return true;
    } catch (error) {
        console.error('Error approving submission:', error);
        throw error;
    }
}

// Reject a submission
export async function rejectSubmission(submissionId, notes = '') {
    try {
        const admin = await isAdmin();
        if (!admin) {
            throw new Error('Unauthorized: Admin access required');
        }

        const { error } = await supabase
            .from('crowd_submissions')
            .update({
                status: 'rejected',
                admin_notes: notes
            })
            .eq('id', submissionId);

        if (error) throw error;

        console.log(`✅ Submission ${submissionId} rejected`);
        return true;
    } catch (error) {
        console.error('Error rejecting submission:', error);
        throw error;
    }
}

// Subscribe to real-time updates
export function subscribeToSubmissions(callback) {
    const subscription = supabase
        .channel('crowd_submissions_changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'crowd_submissions' },
            (payload) => {
                console.log('Submission changed:', payload);
                callback(payload);
            }
        )
        .subscribe();

    return subscription;
}

// Unsubscribe from real-time updates
export function unsubscribeFromSubmissions(subscription) {
    if (subscription) {
        supabase.removeChannel(subscription);
    }
}
