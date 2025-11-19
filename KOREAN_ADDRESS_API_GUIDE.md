# Korean Address Search API Integration Guide

## Overview
This guide explains how to integrate intelligent Korean address search into your app.

## Current Implementation
The app currently uses **mock data** with intelligent filtering that supports:
- Partial matching
- Multi-word search
- Postal code search
- Relevance-based sorting
- Korean character support

## API Options for Production

### 1. **Juso.go.kr (도로명주소 안내시스템)** ⭐ Recommended
**Official Korean government address service**

#### Pros:
- ✅ Free to use
- ✅ Most accurate and comprehensive
- ✅ Official government data
- ✅ Regular updates
- ✅ No rate limits for reasonable use

#### Setup:
1. Visit: https://www.juso.go.kr/
2. Register for an API key (승인키 신청)
3. Get your `confmKey` (API key)

#### API Endpoint:
```
https://www.juso.go.kr/addrlink/addrLinkApi.do
```

#### Parameters:
- `confmKey`: Your API key
- `keyword`: Search keyword
- `currentPage`: Page number (default: 1)
- `countPerPage`: Results per page (default: 10)
- `resultType`: json or xml

#### Example Request:
```javascript
const searchAddress = async (keyword) => {
  const API_KEY = 'YOUR_API_KEY';
  const url = `https://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${API_KEY}&currentPage=1&countPerPage=10&keyword=${encodeURIComponent(keyword)}&resultType=json`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.results?.common?.errorCode === '0') {
    return data.results.juso.map(item => ({
      roadAddress: item.roadAddr,
      jibunAddress: item.jibunAddr,
      postalCode: item.zipNo,
      buildingName: item.bdNm,
    }));
  }
  return [];
};
```

---

### 2. **Kakao Local API**
**Popular commercial service with excellent UX**

#### Pros:
- ✅ Easy to use
- ✅ Good documentation
- ✅ Fast response times
- ✅ Includes coordinates for mapping

#### Cons:
- ❌ Requires Kakao developer account
- ❌ Rate limits on free tier

#### Setup:
1. Visit: https://developers.kakao.com/
2. Create an app
3. Get REST API key

#### API Endpoint:
```
https://dapi.kakao.com/v2/local/search/address.json
```

#### Example Request:
```javascript
const searchAddress = async (keyword) => {
  const API_KEY = 'YOUR_KAKAO_REST_API_KEY';
  const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(keyword)}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `KakaoAK ${API_KEY}`
    }
  });
  
  const data = await response.json();
  return data.documents.map(item => ({
    roadAddress: item.road_address?.address_name,
    jibunAddress: item.address?.address_name,
    postalCode: item.road_address?.zone_no,
  }));
};
```

---

### 3. **Naver Maps API**
**Good for integrated mapping solutions**

#### Pros:
- ✅ Integrates with Naver Maps
- ✅ Good for location-based services

#### Cons:
- ❌ More complex setup
- ❌ Requires Naver Cloud Platform account

---

## Implementation Steps

### Step 1: Choose an API
For most cases, **Juso.go.kr** is recommended as it's free and official.

### Step 2: Get API Key
Register and obtain your API key from the chosen service.

### Step 3: Create API Service File

Create `src/services/addressApi.ts`:

```typescript
const JUSO_API_KEY = 'YOUR_API_KEY_HERE';
const JUSO_API_URL = 'https://www.juso.go.kr/addrlink/addrLinkApi.do';

export interface AddressSearchResult {
  roadAddress: string;
  jibunAddress: string;
  postalCode: string;
  buildingName?: string;
  siNm?: string; // 시도명
  sggNm?: string; // 시군구명
  emdNm?: string; // 읍면동명
}

export const searchKoreanAddress = async (
  keyword: string,
  page: number = 1,
  countPerPage: number = 10
): Promise<AddressSearchResult[]> => {
  try {
    const url = `${JUSO_API_URL}?confmKey=${JUSO_API_KEY}&currentPage=${page}&countPerPage=${countPerPage}&keyword=${encodeURIComponent(keyword)}&resultType=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.results?.common?.errorCode === '0') {
      return data.results.juso.map((item: any) => ({
        roadAddress: item.roadAddr,
        jibunAddress: item.jibunAddr,
        postalCode: item.zipNo,
        buildingName: item.bdNm,
        siNm: item.siNm,
        sggNm: item.sggNm,
        emdNm: item.emdNm,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Address search error:', error);
    throw error;
  }
};
```

### Step 4: Update AddressSearchModal

Replace the mock search in `src/components/AddressSearchModal.tsx`:

```typescript
import { searchKoreanAddress } from '../services/addressApi';

const handleSearch = async () => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    return;
  }

  setIsSearching(true);

  try {
    const results = await searchKoreanAddress(searchQuery);
    const formatted = results.map((item, index) => ({
      id: index.toString(),
      address: item.roadAddress,
      postalCode: item.postalCode,
      roadAddress: item.roadAddress,
      jibunAddress: item.jibunAddress,
    }));
    setSearchResults(formatted);
  } catch (error) {
    console.error('Search error:', error);
    setSearchResults([]);
  } finally {
    setIsSearching(false);
  }
};
```

---

## Environment Variables

Store your API key securely:

1. Create `.env` file:
```
JUSO_API_KEY=your_api_key_here
```

2. Install dotenv:
```bash
npm install react-native-dotenv
```

3. Use in code:
```typescript
import { JUSO_API_KEY } from '@env';
```

---

## Testing

Test with common Korean addresses:
- "강남구 테헤란로"
- "서울시 중구"
- "부산 해운대"
- "06236" (postal code)

---

## Best Practices

1. **Debouncing**: Add delay before searching to reduce API calls
2. **Caching**: Cache recent searches
3. **Error Handling**: Show user-friendly error messages
4. **Loading States**: Show loading indicators
5. **Empty States**: Guide users when no results found

---

## Current Mock Data Features

The current implementation includes:
- ✅ 10 sample Korean addresses
- ✅ Intelligent fuzzy matching
- ✅ Multi-word search support
- ✅ Postal code search
- ✅ Relevance-based sorting
- ✅ Korean character support

This works well for development and testing!

---

## Need Help?

- Juso.go.kr Documentation: https://www.juso.go.kr/addrlink/devAddrLinkRequestGuide.do
- Kakao Developers: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- Naver Cloud Platform: https://www.ncloud.com/product/applicationService/maps
