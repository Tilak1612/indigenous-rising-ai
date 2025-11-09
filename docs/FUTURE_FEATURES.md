# Future Features - Backlog

## Phase 2: Core Platform Enhancements

### 🌍 Multi-Language Support (Priority: High)
**Status**: Removed non-functional selector, planned for Phase 2

**Why Removed**: The LanguageSelector component was displaying in navigation but was non-functional, potentially misleading users into thinking they could change languages.

**Planned Implementation**:
- Full internationalization (i18n) with react-i18next
- Supported languages:
  - English (default)
  - French (Français)
  - Ojibwe (Anishinaabemowin)
  - Cree (ᓀᐦᐃᔭᐍᐏᐣ)
  - Inuktitut (ᐃᓄᒃᑎᑐᑦ)
  - Mi'kmaq (Mi'kmaw)

**Technical Requirements**:
```typescript
// Language structure
interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  translations: {
    [key: string]: string;
  };
}

// Translation file structure
src/
├── locales/
│   ├── en/
│   │   ├── common.json
│   │   ├── forms.json
│   │   └── business.json
│   ├── fr/
│   ├── oj/
│   ├── cr/
│   ├── iu/
│   └── mi/
```

**Cultural Considerations**:
- Work with Indigenous language experts for accurate translations
- Respect cultural protocols for certain terms
- Provide audio pronunciation guides
- Include glossary for traditional terms
- Allow users to contribute translations

**Acceptance Criteria**:
- [ ] i18n library integrated
- [ ] All UI text extracted to translation files
- [ ] Language selector functional in navigation
- [ ] Language preference persisted (localStorage + database)
- [ ] All forms support multi-language validation
- [ ] Email templates available in all languages
- [ ] Cultural review completed for each language
- [ ] RTL support if needed for future languages

**Estimated Effort**: 3-4 weeks
**Dependencies**: Cultural consultants, translation services

---

## Other Phase 2 Features

### 🔐 User Authentication
- Sign up / Sign in with email
- Social auth (Google, LinkedIn)
- Two-factor authentication
- Profile management
- Session management

### 💼 Business Planning Tools
- AI-powered business plan generator
- Financial projections calculator
- Market analysis tools
- SWOT analysis templates
- Cultural business model canvas

### 💰 Funding Database
- Searchable grant database
- Funding eligibility checker
- Application tracking
- Deadline notifications
- Success tips and resources

### 🤝 Community Features
- User profiles and networking
- Mentorship matching
- Discussion forums
- Success stories sharing
- Events calendar

---

## Phase 3: Advanced Features

### 📱 Mobile Applications
- Native iOS app (React Native)
- Native Android app (React Native)
- Offline mode support
- Push notifications
- Mobile-optimized workflows

### 📊 Analytics Dashboard
- Business performance metrics
- Funding pipeline visualization
- Community engagement stats
- AI insights and recommendations
- Export reports (PDF, CSV)

### 🏛️ Government Integration
- Connect to NACCA systems
- INAC portal integration
- Provincial business registries
- Tax filing assistance
- Regulatory compliance checks

### 👴 Elder Wisdom Knowledge Base
- Traditional business practices
- Cultural protocols database
- Video interviews with elders
- Community success stories
- Seasonal business guidance

### 🎓 Training & Mentorship
- Online courses (business, tech)
- Live webinars and workshops
- One-on-one mentorship matching
- Peer learning groups
- Certification programs

---

## Contributing to Feature Development

Have ideas for features? We welcome community input!

**How to Contribute**:
1. Open an issue on GitHub with your feature suggestion
2. Describe the problem it solves
3. Explain how it respects Indigenous data sovereignty
4. Consider cultural implications
5. Tag with appropriate labels

**Feature Criteria**:
- ✅ Respects OCAP™ principles
- ✅ PIPEDA compliant
- ✅ Culturally appropriate
- ✅ Accessible (WCAG 2.1 AA)
- ✅ User-centered design
- ✅ Sustainable and scalable

---

## Removed Components

### LanguageSelector.tsx
**Location**: `src/components/LanguageSelector.tsx`
**Status**: Kept in codebase for future reference
**Reason for Removal**: Non-functional, misleading users
**Future**: Will be reactivated when i18n is implemented

**Original Implementation**:
```tsx
// Dropdown with 6 languages
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'oj', name: 'Ojibwe', nativeName: 'Anishinaabemowin' },
  { code: 'cr', name: 'Cree', nativeName: 'ᓀᐦᐃᔭᐍᐏᐣ' },
  { code: 'iu', name: 'Inuktitut', nativeName: 'ᐃᓄᒃᑎᑐᑦ' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'mi', name: "Mi'kmaq", nativeName: "Mi'kmaw" },
];
```

This component can be reused when translations are ready.

---

Last Updated: 2025-01-15
