// app/_services/emailQueue.js
// Email gönderimlerini sıraya koyan ve rate limiting uygulayan queue sistemi

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastSentTime = 0;
    
    // Rate limiting ayarları
    // Her email arasında minimum bekleme süresi (milisaniye)
    this.minDelayBetweenEmails = parseInt(process.env.EMAIL_MIN_DELAY_MS || '2000'); // Varsayılan 2 saniye
    
    // Dakika başına maksimum email sayısı
    this.maxEmailsPerMinute = parseInt(process.env.EMAIL_MAX_PER_MINUTE || '30'); // Varsayılan 30 email/dakika
    
    // Saat başına maksimum email sayısı
    this.maxEmailsPerHour = parseInt(process.env.EMAIL_MAX_PER_HOUR || '200'); // Varsayılan 200 email/saat
    
    // Son dakika ve saat içindeki email gönderim zamanlarını takip et
    this.recentSentTimes = [];
    
    console.log('EmailQueue initialized with settings:', {
      minDelayBetweenEmails: this.minDelayBetweenEmails,
      maxEmailsPerMinute: this.maxEmailsPerMinute,
      maxEmailsPerHour: this.maxEmailsPerHour
    });
  }

  // Son gönderim zamanlarını temizle (eski kayıtları kaldır)
  cleanupOldSentTimes() {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    // Son saat içindeki gönderimleri tut
    this.recentSentTimes = this.recentSentTimes.filter(time => time > oneHourAgo);
  }

  // Rate limit kontrolü yap
  checkRateLimit() {
    this.cleanupOldSentTimes();
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    
    // Son dakika içindeki email sayısı
    const emailsInLastMinute = this.recentSentTimes.filter(time => time > oneMinuteAgo).length;
    
    // Son saat içindeki email sayısı
    const emailsInLastHour = this.recentSentTimes.filter(time => time > oneHourAgo).length;
    
    // Rate limit kontrolü
    if (emailsInLastMinute >= this.maxEmailsPerMinute) {
      const oldestInMinute = Math.min(...this.recentSentTimes.filter(time => time > oneMinuteAgo));
      const waitTime = oldestInMinute + 60000 - now + 1000; // 1 saniye ek güvenlik
      return {
        allowed: false,
        waitTime: Math.max(waitTime, this.minDelayBetweenEmails),
        reason: `Dakika başına limit aşıldı (${emailsInLastMinute}/${this.maxEmailsPerMinute})`
      };
    }
    
    if (emailsInLastHour >= this.maxEmailsPerHour) {
      const oldestInHour = Math.min(...this.recentSentTimes.filter(time => time > oneHourAgo));
      const waitTime = oldestInHour + 3600000 - now + 1000; // 1 saniye ek güvenlik
      return {
        allowed: false,
        waitTime: Math.max(waitTime, this.minDelayBetweenEmails),
        reason: `Saat başına limit aşıldı (${emailsInLastHour}/${this.maxEmailsPerHour})`
      };
    }
    
    // Minimum delay kontrolü
    const timeSinceLastEmail = now - this.lastSentTime;
    if (timeSinceLastEmail < this.minDelayBetweenEmails) {
      return {
        allowed: false,
        waitTime: this.minDelayBetweenEmails - timeSinceLastEmail,
        reason: 'Minimum delay kontrolü'
      };
    }
    
    return { allowed: true };
  }

  // Email'i kuyruğa ekle
  async enqueue(emailFunction, ...args) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        emailFunction,
        args,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      console.log(`Email kuyruğa eklendi. Kuyruk uzunluğu: ${this.queue.length}`);
      
      // Eğer işlem yapılmıyorsa başlat
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  // Kuyruğu işle
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Email kuyruğu işleniyor. Kalan: ${this.queue.length}`);

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      
      try {
        // Rate limit kontrolü
        const rateLimitCheck = this.checkRateLimit();
        
        if (!rateLimitCheck.allowed) {
          console.log(`Rate limit nedeniyle bekleme: ${rateLimitCheck.reason}, ${Math.ceil(rateLimitCheck.waitTime / 1000)} saniye`);
          
          // Email'i tekrar kuyruğun başına ekle
          this.queue.unshift(item);
          
          // Bekleme süresi kadar bekle
          await this.sleep(rateLimitCheck.waitTime);
          continue;
        }

        // Email gönder
        console.log('Email gönderiliyor...');
        const result = await item.emailFunction(...item.args);
        
        // Gönderim zamanını kaydet
        const now = Date.now();
        this.lastSentTime = now;
        this.recentSentTimes.push(now);
        
        // Başarılı
        item.resolve(result);
        console.log('Email başarıyla gönderildi');
        
        // Minimum delay beklemesi (eğer gerekirse)
        if (this.queue.length > 0) {
          await this.sleep(this.minDelayBetweenEmails);
        }
        
      } catch (error) {
        console.error('Email gönderme hatası:', error);
        item.reject(error);
        
        // Hata durumunda da kısa bir bekleme yap
        if (this.queue.length > 0) {
          await this.sleep(1000);
        }
      }
    }

    this.processing = false;
    console.log('Email kuyruğu işlendi');
  }

  // Bekleme fonksiyonu
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Kuyruk durumunu al
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      lastSentTime: this.lastSentTime,
      recentSentCount: {
        lastMinute: this.recentSentTimes.filter(time => time > Date.now() - 60000).length,
        lastHour: this.recentSentTimes.filter(time => time > Date.now() - 3600000).length
      },
      settings: {
        minDelayBetweenEmails: this.minDelayBetweenEmails,
        maxEmailsPerMinute: this.maxEmailsPerMinute,
        maxEmailsPerHour: this.maxEmailsPerHour
      }
    };
  }
}

// Singleton instance
let emailQueueInstance = null;

export function getEmailQueue() {
  if (!emailQueueInstance) {
    emailQueueInstance = new EmailQueue();
  }
  return emailQueueInstance;
}

export default getEmailQueue;

