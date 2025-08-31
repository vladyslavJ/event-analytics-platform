export default () => ({
  nats: {
    url: process.env.NATS_URL || 'nats://nats:4222',
  },
});
