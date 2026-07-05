const https = require('https');
https.get('https://jontydutta.github.io/Trackent-Expense-Tracker/', (res) => {
  let html = '';
  res.on('data', d => html += d);
  res.on('end', () => {
    const match = html.match(/src="\/Trackent-Expense-Tracker\/assets\/(index-[^"]+\.js)"/);
    if(match) {
      https.get('https://jontydutta.github.io/Trackent-Expense-Tracker/assets/' + match[1], (res2) => {
        let js = '';
        res2.on('data', d => js += d);
        res2.on('end', () => {
           const supabaseUrls = js.match(/https:\/\/[a-zA-Z0-9-]+\.supabase\.co/g);
           console.log('Found Supabase URLs:', supabaseUrls ? supabaseUrls.length : 0);
        });
      });
    } else {
      console.log('No JS bundle found in HTML');
    }
  });
});
