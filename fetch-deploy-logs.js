const { execSync } = require('child_process');

try {
  const streamsOut = execSync('aws logs describe-log-streams --log-group-name /aws/apprunner/prediversa-backend/8ff7be9d96004a8bb6f7506f48125416/service --region us-east-1 --order-by LastEventTime --descending --limit 1');
  const streamName = JSON.parse(streamsOut).logStreams[0].logStreamName;
  
  const eventsOut = execSync(`aws logs get-log-events --log-group-name /aws/apprunner/prediversa-backend/8ff7be9d96004a8bb6f7506f48125416/service --log-stream-name "${streamName}" --region us-east-1`);
  
  const messages = JSON.parse(eventsOut).events.map(e => e.message);
  console.log(messages.join('\n'));
} catch(e) {
  console.error('Script Error:', e.message);
}
