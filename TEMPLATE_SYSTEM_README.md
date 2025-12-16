# Sertifika Şablon Sistemi

Bu dokümantasyon, yeni dinamik sertifika şablon sisteminin nasıl çalıştığını ve nasıl kullanılacağını açıklar.

## Genel Bakış

Önceki sistemde sertifika formatları sabit kodlanmıştı. Yeni sistem ile her organizasyon kendi özel sertifika şablonlarını oluşturabilir, düzenleyebilir ve yönetebilir.

## Veritabanı Yapısı

### certificate_templates Tablosu

```sql
CREATE TABLE public.certificate_templates (
  id serial NOT NULL,
  name text NOT NULL,
  description text NULL,
  background_image text NOT NULL,
  organization_slug text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  design_settings jsonb NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT certificate_templates_pkey PRIMARY KEY (id),
  CONSTRAINT unique_default_per_org UNIQUE (organization_slug, is_default) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT certificate_templates_organization_slug_fkey FOREIGN KEY (organization_slug) REFERENCES organizations (slug) ON DELETE CASCADE
);
```

### certificates Tablosu Güncellemesi

```sql
ALTER TABLE public.certificates ADD COLUMN template_id integer NULL;
ALTER TABLE public.certificates ADD CONSTRAINT fk_certificates_template_id FOREIGN KEY (template_id) REFERENCES certificate_templates (id) ON DELETE SET NULL;
```

## Design Settings JSON Yapısı

```json
{
  "fonts": {
    "body": "sans_serif",
    "name": "sans_serif", 
    "title": "sans_serif"
  },
  "colors": {
    "name": "#022d74",
    "text": "#003780",
    "primary": "#990000",
    "secondary": "#666666",
    "institution": "#8a0000",
    "certificate_no": "#ffffff"
  },
  "layout": {
    "date_position": {
      "x": 23,
      "y": 116,
      "align": "center",
      "enabled": true,
      "x_manual": 20,
      "y_manual": 80
    },
    "name_position": {
      "x": 44.5,
      "y": 5,
      "align": "left",
      "enabled": true,
      "x_manual": 42,
      "y_manual": 43.3
    },
    "title_position": {
      "x": 42,
      "y": 20,
      "align": "center",
      "enabled": false,
      "x_manual": 50,
      "y_manual": 20
    },
    "signature_position": {
      "x": 80,
      "y": 80,
      "align": "center",
      "enabled": false,
      "x_manual": 80,
      "y_manual": 80
    },
    "description_position": {
      "x": 50,
      "y": 55,
      "align": "center",
      "enabled": false,
      "x_manual": 50,
      "y_manual": 55
    },
    "institution_position": {
      "x": 23.5,
      "y": 76.5,
      "align": "left",
      "enabled": false,
      "x_manual": 30,
      "y_manual": 75
    },
    "certificate_no_position": {
      "x": 11,
      "y": 97.5,
      "align": "right",
      "enabled": true,
      "x_manual": 70,
      "y_manual": 75
    }
  },
  "font_sizes": {
    "date": 17,
    "name": 29,
    "title": 26,
    "signature": 14,
    "institution": 21,
    "certificate_no": 12
  }
}
```

## Pozisyon Sistemi

- **x, y**: Yüzde bazlı koordinatlar (0-100)
- **align**: Metin hizalaması (left, center, right)
- **enabled**: Element'in aktif olup olmadığı
- **x_manual, y_manual**: Manuel koordinatlar (gelecekte kullanım için)

## Font Seçenekleri

- `sans_serif`: System UI, Arial, Helvetica
- `serif`: Georgia, Times New Roman
- `monospace`: Courier, Monaco, Consolas
- `cursive`: Cursive
- `fantasy`: Fantasy

## Bileşenler

### 1. TemplateManager
Ana şablon yönetim bileşeni. Şablonları listeler, oluşturur, düzenler ve siler.

**Özellikler:**
- Şablon listesi görüntüleme
- Yeni şablon oluşturma
- Mevcut şablon düzenleme
- Şablon silme
- Basit ve gelişmiş düzenleyici arasında geçiş

### 2. AdvancedTemplateEditor
Görsel şablon düzenleyici. Canvas üzerinde elementleri sürükle-bırak ile konumlandırma.

**Özellikler:**
- Canvas üzerinde görsel düzenleme
- Sürükle-bırak element konumlandırma
- Gerçek zamanlı önizleme
- Zoom kontrolü
- Font boyutu, renk ve hizalama ayarları

## Kullanım

### 1. Şablon Oluşturma

```typescript
import { createTemplate } from '../utils/certificateGenerator';

const newTemplate = await createTemplate({
  name: 'Klasik Şablon',
  description: 'Geleneksel ve profesyonel görünüm',
  background_image: 'https://example.com/background.png',
  organization_slug: 'my-org',
  is_default: true,
  design_settings: JSON.stringify(defaultDesignSettings)
});
```

### 2. Şablon Kullanarak Sertifika Oluşturma

```typescript
import { generateCertificateCanvas } from '../utils/certificateGenerator';

const canvas = await generateCertificateCanvas(certificateData);
```

### 3. Şablon Listesi Getirme

```typescript
import { getAllTemplatesForOrganization } from '../utils/certificateGenerator';

const templates = await getAllTemplatesForOrganization('my-org');
```

## API Endpoints

### GET /api/templates/{organizationSlug}
Organizasyon için tüm şablonları getirir.

### POST /api/templates
Yeni şablon oluşturur.

### PUT /api/templates/{id}
Şablon günceller.

### DELETE /api/templates/{id}
Şablon siler.

## Güvenlik

- Her organizasyon sadece kendi şablonlarını görebilir ve düzenleyebilir
- Şablon silme işlemi onay gerektirir
- Varsayılan şablon değişikliği kontrollü yapılır

## Performans

- Şablonlar cache'lenir
- Arka plan resimleri lazy loading ile yüklenir
- Canvas işlemleri optimize edilmiştir

## Gelecek Geliştirmeler

1. **Şablon Kategorileri**: Farklı sertifika türleri için kategoriler
2. **Şablon Paylaşımı**: Organizasyonlar arası şablon paylaşımı
3. **Versiyon Kontrolü**: Şablon değişiklik geçmişi
4. **Toplu İşlemler**: Birden fazla şablonu aynı anda düzenleme
5. **Şablon Marketi**: Hazır şablon satın alma/satma
6. **AI Destekli Düzenleme**: Otomatik şablon optimizasyonu

## Sorun Giderme

### Yaygın Sorunlar

1. **Şablon yüklenmiyor**: Arka plan resim URL'sini kontrol edin
2. **Elementler görünmüyor**: `enabled` değerlerini kontrol edin
3. **Font yüklenmiyor**: Font ailesi adını kontrol edin
4. **Canvas boyut hatası**: Arka plan resim boyutlarını kontrol edin

### Debug Modu

```typescript
// Console'da debug bilgilerini görmek için
localStorage.setItem('debug_templates', 'true');
```

## Test

Demo sayfası: `/demo-templates`

Bu sayfa tüm özellikleri test etmenizi sağlar:
- Şablon oluşturma
- Görsel düzenleme
- Şablon yönetimi
- Önizleme

## Destek

Sorunlar için:
1. Console loglarını kontrol edin
2. Network sekmesinde API çağrılarını inceleyin
3. Veritabanı bağlantısını test edin
4. Şablon JSON formatını doğrulayın
