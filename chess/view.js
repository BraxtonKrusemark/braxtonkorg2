const SUPABASE_URL = 'https://iocetaelftxbexanzwnx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvY2V0YWVsZnR4YmV4YW56d254Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAxODc3MiwiZXhwIjoyMDY5NTk0NzcyfQ.CEyPFT4YjYmPYpd6oBgl9Ox_MPvpJVCehodx0CBkLxg';

const { createClient } = supabase;
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

const statsDiv = document.getElementById('player-stats');
const attendanceDiv = document.getElementById('attendance-view');

async function fetchAndRender() {
    try {
        const { data: players, error: pErr } = await supa.from('players').select();
        const { data: matches, error: mErr } = await supa.from('matches').select();
        const { data: attendance, error: aErr } = await supa.from('attendance').select();

        if (pErr) {
            statsDiv.innerHTML = `<p style="color:red;">Error loading players: ${pErr.message}</p>`;
            return;
        }
        if (mErr) {
            statsDiv.innerHTML = `<p style="color:red;">Error loading matches: ${mErr.message}</p>`;
            return;
        }
        if (aErr) {
            attendanceDiv.innerHTML = `<p style="color:red;">Error loading attendance: ${aErr.message}</p>`;
            return;
        }

        renderStats(players, matches);
        renderAttendance(attendance, players);
    } catch (err) {
        statsDiv.innerHTML = `<p style="color:red;">Unexpected error: ${err.message}</p>`;
    }
}

function renderStats(players = [], matches = []) {
    statsDiv.innerHTML = '';
    if (players.length === 0) {
        statsDiv.innerHTML = '<p>No players found.</p>';
        return;
    }

    players.forEach(p => {
        const head2head = {};
        players.filter(o => o.id !== p.id).forEach(o => {
            head2head[o.id] = { name: o.name, wins: 0, losses: 0 };
        });

        matches.forEach(m => {
            if (String(m.winner_id) === String(p.id) && head2head[m.loser_id]) head2head[m.loser_id].wins++;
            if (String(m.loser_id) === String(p.id) && head2head[m.winner_id]) head2head[m.winner_id].losses++;
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

function renderAttendance(attendance = [], players = []) {
    attendanceDiv.innerHTML = '<h2>Attendance Records</h2>';
    if (attendance.length === 0) {
        attendanceDiv.innerHTML += '<p>No attendance records found.</p>';
        return;
    }

    // Group attendance by date
    const grouped = {};
    attendance.forEach(record => {
        if (!grouped[record.date]) grouped[record.date] = [];
        grouped[record.date].push(record);
    });

    for (const date in grouped) {
        attendanceDiv.innerHTML += `<h3>${date}</h3>`;
        attendanceDiv.innerHTML += `
      <table>
        <tr><th>Player</th><th>Present</th></tr>
        ${grouped[date].map(rec => {
            const player = players.find(p => p.id === rec.player_id);
            return `<tr><td>${player ? player.name : 'Unknown'}</td><td>${rec.present ? '✔️' : '❌'}</td></tr>`;
        }).join('')}
      </table>
    `;
    }
}

fetchAndRender();
