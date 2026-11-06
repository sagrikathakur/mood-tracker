import EventEmitter from "events";

/**
 * Calm Me Event Streaming Service
 * Supports Apache Kafka (via kafkajs) with resilient fallback to local in-memory event bus.
 * Zero crashes if Kafka broker or package is not yet connected.
 */

class KafkaService {
  constructor() {
    this.kafka = null;
    this.producer = null;
    this.consumer = null;
    this.isConnected = false;
    this.useMock = false;
    this.localBus = new EventEmitter();

    // Default topics
    this.TOPICS = {
      GAME_SCORES: "calmme.game.scores",
      TELEMETRY: "calmme.telemetry",
      NOTIFICATIONS: "calmme.notifications",
    };
  }

  /**
   * Initialize Kafka producer and consumer
   */
  async init() {
    const brokers = process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(",") : ["localhost:9092"];
    const clientId = process.env.KAFKA_CLIENT_ID || "calmme-sanctuary";

    try {
      // 1. Attempt dynamic import of kafkajs
      const kafkaModule = await import("kafkajs").catch(() => null);

      if (!kafkaModule || !kafkaModule.Kafka) {
        this.enableMockMode("kafkajs package not installed yet (run 'npm install kafkajs' in /server when ready)");
        return;
      }

      // 2. Instantiate Kafka client
      const { Kafka, logLevel } = kafkaModule;
      this.kafka = new Kafka({
        clientId,
        brokers,
        logLevel: logLevel.NOTHING,
        retry: {
          initialRetryTime: 300,
          retries: 3,
        },
      });

      this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
      this.consumer = this.kafka.consumer({ groupId: `${clientId}-consumer-group` });

      // Connect with timeout guard to prevent server hanging if broker is offline
      const connectPromise = Promise.all([this.producer.connect(), this.consumer.connect()]);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout to Kafka broker")), 3500)
      );

      await Promise.race([connectPromise, timeoutPromise]);

      this.isConnected = true;
      console.log(`[Kafka] Connected successfully to brokers: ${brokers.join(", ")} ⚡`);

      // 3. Subscribe consumer to topics
      await this.consumer.subscribe({
        topics: Object.values(this.TOPICS),
        fromBeginning: false,
      });

      // 4. Start consumer message listener
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const raw = message.value?.toString();
            const payload = raw ? JSON.parse(raw) : {};
            this.handleIncomingEvent(topic, payload, partition, message.offset);
          } catch (err) {
            console.warn(`[Kafka] Failed parsing message from ${topic}:`, err.message);
          }
        },
      });
    } catch (err) {
      this.enableMockMode(`Broker connection failed (${err.message})`);
    }
  }

  /**
   * Fallback in-memory stream for local development without active broker
   */
  enableMockMode(reason) {
    this.useMock = true;
    this.isConnected = true;
    console.log(`[Kafka] Using resilient Event Bus (${reason}) 🍃`);

    // Listen on local bus for simulated consumer processing
    this.localBus.on("event", ({ topic, payload }) => {
      this.handleIncomingEvent(topic, payload, 0, Date.now());
    });
  }

  /**
   * Dispatch an event to a Kafka topic
   */
  async sendEvent(topic, payload, key = null) {
    const serialized = JSON.stringify(payload);

    try {
      if (this.producer && !this.useMock) {
        await this.producer.send({
          topic,
          messages: [
            {
              key: key ? String(key) : null,
              value: serialized,
              timestamp: Date.now().toString(),
            },
          ],
        });
      } else {
        // Local event dispatch
        setImmediate(() => {
          this.localBus.emit("event", { topic, payload });
        });
      }
      return true;
    } catch (err) {
      console.warn(`[Kafka] Could not publish event to topic "${topic}":`, err.message);
      // Fallback locally so events are never dropped
      this.localBus.emit("event", { topic, payload });
      return false;
    }
  }

  /**
   * Process incoming messages from topics
   */
  handleIncomingEvent(topic, payload, partition = 0, offset = 0) {
    const timestamp = new Date().toISOString();

    switch (topic) {
      case this.TOPICS.GAME_SCORES:
        console.log(
          `[Kafka:Stream] 🎮 [${topic} p:${partition} o:${offset}] Run recorded for ${payload.playerName || "Runner"}: ${payload.score || 0} pts (${payload.mode || "arcade"})`
        );
        break;

      case this.TOPICS.TELEMETRY:
        console.log(
          `[Kafka:Stream] ⏱️ [${topic} p:${partition} o:${offset}] Screen telemetry for user #${payload.userId}: ${payload.screenTimeHours || 0} hrs`
        );
        break;

      case this.TOPICS.NOTIFICATIONS:
        console.log(
          `[Kafka:Stream] 📨 [${topic} p:${partition} o:${offset}] Sanctuary message received from ${payload.email} (${payload.topic})`
        );
        break;

      default:
        console.log(`[Kafka:Stream] 📦 [${topic}] Event received:`, payload);
        break;
    }
  }

  /**
   * Graceful disconnect on server termination
   */
  async disconnect() {
    try {
      if (this.producer) await this.producer.disconnect();
      if (this.consumer) await this.consumer.disconnect();
      console.log("[Kafka] Disconnected gracefully.");
    } catch (err) {
      console.warn("[Kafka] Error during disconnect:", err.message);
    }
  }
}

export const kafkaService = new KafkaService();
export default kafkaService;

