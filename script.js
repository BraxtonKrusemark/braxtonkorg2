



const SUPABASE_URL = 'https://iocetaelftxbexanzwnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvY2V0YWVsZnR4YmV4YW56d254Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAxODc3MiwiZXhwIjoyMDY5NTk0NzcyfQ.CEyPFT4YjYmPYpd6oBgl9Ox_MPvpJVCehodx0CBkLxg';

const { createClient } = supabase;
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

const addBtn = document.getElementById('add-player-btn');
const winnerSelect = document.getElementById('winner-select');
const loserSelect = document.getElementById('loser-select');
const recordBtn = document.getElementById('record-btn');
const statsDiv = document.getElementById('player-stats');

const PASSWORD = 'chess123';  // set your password here

function requirePassword() {
    const userPass = prompt('Enter the password to access the Chess Club Tracker:');
    if (userPass !== PASSWORD) {
        alert('Incorrect password! You will be redirected.');
        document.body.innerHTML = '<h2>Access Denied</h2>';
        throw new Error('Access denied');
    }
}

requirePassword();

const attendanceList = document.getElementById('attendance-list');
const attendanceForm = document.getElementById('attendance-form');
const attendanceMessage = document.getElementById('attendance-message');

async function loadAttendanceForm() {
    const { data: players, error } = await supa.from('players').select();
    if (error) {
        attendanceMessage.textContent = 'Error loading players for attendance.';
        return;
    }

    attendanceList.innerHTML = '';
    players.forEach(player => {
        const div = document.createElement('div');
        div.innerHTML = `
      <label>
        <input type="checkbox" name="present" value="${player.id}" />
        ${player.name}
      </label>
    `;
        attendanceList.appendChild(div);
    });
}

attendanceForm.onsubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(attendanceForm);
    const presentIds = formData.getAll('present'); // array of player IDs who are present
    const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD

    // Prepare attendance records for all players, marking present or absent
    const { data: players } = await supa.from('players').select();

    const records = players.map(p => ({
        player_id: p.id,
        date: today,
        present: presentIds.includes(String(p.id)) || presentIds.includes(p.id)
    }));

    // Insert attendance records in bulk
    const { error } = await supa.from('attendance').insert(records);

    if (error) {
        attendanceMessage.textContent = 'Error saving attendance: ' + error.message;
    } else {
        attendanceMessage.textContent = 'Attendance saved for ' + today;
    }
};

// Load attendance form on page load or after players load
loadAttendanceForm();


addBtn.onclick = async () => {
    const name = prompt("Enter new player's name:");
    if (!name) return;
    const { error } = await supa.from('players').insert([{ name }]);
    if (error) {
        console.error('Error adding player:', error.message);
        alert('Error adding player: ' + error.message);
        return;
    }
    await refreshAll();
};

recordBtn.onclick = async () => {
    const winner = winnerSelect.value;
    const loser = loserSelect.value;

    if (!winner || !loser || winner === loser) {
        alert('Please select two different players');
        return;
    }

    const { error } = await supa.from('matches').insert([
        { winner_id: winner, loser_id: loser }
    ]);

    if (error) {
        console.error('Failed to record match:', error.message);
        alert('Error recording match: ' + error.message);
        return;
    }

    await refreshAll();
};

async function refreshAll() {
    try {
        const { data: players, error: pErr } = await supa.from('players').select();
        const { data: matches, error: mErr } = await supa.from('matches').select();

        if (pErr) {
            console.error('Players fetch error:', pErr);
            statsDiv.innerHTML = `<p style="color:red;">Error loading players: ${pErr.message}</p>`;
            return;
        }
        if (mErr) {
            console.error('Matches fetch error:', mErr);
            statsDiv.innerHTML = `<p style="color:red;">Error loading matches: ${mErr.message}</p>`;
            return;
        }

        console.log('Players:', players);
        console.log('Matches:', matches);
        console.log('Players IDs:', players.map(p => p.id));
        console.log('Matches IDs:', matches.map(m => ({ winner: m.winner_id, loser: m.loser_id })));

        renderSelects(players);
        renderStats(players, matches);

    } catch (err) {
        console.error('Unexpected error in refreshAll:', err);
        statsDiv.innerHTML = `<p style="color:red;">Unexpected error: ${err.message}</p>`;
    }
}

function renderSelects(players = []) {
    [winnerSelect, loserSelect].forEach(sel => {
        sel.innerHTML = '<option value="">-- select --</option>';
        players.forEach(p => {
            sel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        });
    });
}

function renderStats(players = [], matches = []) {
    statsDiv.innerHTML = '';
    if (players.length === 0) {
        statsDiv.innerHTML = '<p>No players found.</p>';
        return;
    }

    players.forEach(p => {
        console.log('Rendering stats for player:', p.name);
        const head2head = {};
        players.filter(o => o.id !== p.id).forEach(o => {
            head2head[o.id] = { name: o.name, wins: 0, losses: 0 };
        });

        matches.forEach(m => {
            console.log(`Match: winner ${m.winner_id}, loser ${m.loser_id}`);

            if (String(m.winner_id) === String(p.id) && head2head[m.loser_id]) {
                head2head[m.loser_id].wins++;
                console.log(`Increment win for ${head2head[m.loser_id].name}`);
            }
            if (String(m.loser_id) === String(p.id) && head2head[m.winner_id]) {
                head2head[m.winner_id].losses++;
                console.log(`Increment loss for ${head2head[m.winner_id].name}`);
            }
        });

        const tableRows = Object.values(head2head).map(h => {
            if (h.wins + h.losses === 0) return '';
            const ratio = h.losses === 0 ? '∞' : (h.wins / h.losses).toFixed(2);
            return `<tr><td>${h.name}</td><td>${h.wins}</td><td>${h.losses}</td><td>${ratio}</td></tr>`;
        }).join('');

        statsDiv.innerHTML += `
      <h3>${p.name}</h3>
      <table>
        <tr><th>Opponent</th><th>W</th><th>L</th><th>W/L Ratio</th></tr>
        ${tableRows || '<tr><td colspan="4">No matches yet</td></tr>'}
      </table>
    `;
    });
}

// For quick UI test, uncomment below and comment out the above renderStats()
// function renderStats(players = [], matches = []) {
//     statsDiv.innerHTML = '<p>Test content: ' + players.length + ' players, ' + matches.length + ' matches</p>';
// }

refreshAll();
