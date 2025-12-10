# ai-services-integration

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: AI Integration
**priority**: MEDIA
---

## 📖 Overview

AI services integration patterns for n8n, Flowise, Qdrant, and Redis.

---

## 📦 Versions

- **n8n**: `1.19.4`
- **Flowise**: `1.4.12`
- **Qdrant**: `1.7.4`
- **Redis**: `7.2.3`

---

## 🚨 Critical Rules

1. ❌ **NUNCA exponer n8n API tokens en cliente**
2. ❌ **NUNCA crear Qdrant collections sin dimensiones correctas**
3. ❌ **NUNCA cachear en Redis sin TTL**
4. ✅ **SIEMPRE implementar rate limiting en AI endpoints**
5. ✅ **SIEMPRE sanitizar input antes de enviar a LLMs**
