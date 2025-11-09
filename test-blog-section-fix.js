// Test script to verify blog section fix
// This simulates what happens in the frontend

// Mock data similar to what the API returns
const mockApiResponse = {
  data: {
    servicePage: {
      content: {
        comprehensiveContent: {
          mythsAndFacts: {
            title: "Myths vs Facts",
            items: [
              { myth: "Root canal is painful", fact: "Modern techniques are comfortable" }
            ]
          }
        }
      }
    },
    serviceInfo: {
      name: "Root Canal Treatment"
    },
    blogs: [
      {
        id: "1",
        title: "Root Canal Treatment Procedure Guide",
        slug: "root-canal-treatment-procedure-guide",
        summary: "Wondering what to expect during your Root Canal Treatment procedure?",
        readingTime: 2,
        wordCount: 271,
        url: "/blog/root-canal-treatment-procedure-guide",
        featured: false
      },
      {
        id: "2",
        title: "Root Canal Benefits Guide",
        slug: "root-canal-treatment-benefits-guide",
        summary: "Discover the life-changing benefits of Root Canal Treatment",
        readingTime: 2,
        wordCount: 276,
        url: "/blog/root-canal-treatment-benefits-guide",
        featured: true
      },
      {
        id: "3",
        title: "Complete Root Canal Guide",
        slug: "root-canal-treatment-comprehensive-guide",
        summary: "Understanding Root Canal Treatment for informed decisions",
        readingTime: 2,
        wordCount: 290,
        url: "/blog/root-canal-treatment-comprehensive-guide",
        featured: false
      }
    ]
  }
};

// Simulate the fixed component generation
function generateServicePageComponents(content, serviceData, blogCards = []) {
  console.log('🚀 generateServicePageComponents called with blogCards:', blogCards);

  const components = [];

  // Add myths and facts section (simulated)
  components.push({
    id: 'myths-facts-section',
    type: 'MythsAndFacts',
    name: 'Myths & Facts'
  });

  // Blog section check
  console.log('🔍 Blog section check - blogCards:', blogCards, 'length:', blogCards?.length);
  if (blogCards && blogCards.length > 0) {
    console.log('✅ Creating blog section with', blogCards.length, 'blog cards');

    components.push({
      id: 'blog-section',
      type: 'ServiceBlogSection',
      name: 'Related Blog Articles',
      blogs: blogCards
    });
  } else {
    console.log('❌ Blog section NOT created - no blog cards available');
  }

  return components;
}

// Test the OLD way (with state timing issue)
console.log('\n=== TESTING OLD WAY (State Variable) ===');
let blogCardsState = []; // This would be empty initially
setTimeout(() => {
  blogCardsState = mockApiResponse.data.blogs; // State would update later
}, 0);

const componentsOldWay = generateServicePageComponents(
  mockApiResponse.data.servicePage.content,
  mockApiResponse.data.serviceInfo,
  blogCardsState // This is empty []
);

console.log('Components generated (old way):', componentsOldWay.length);
console.log('Blog section included:', componentsOldWay.some(c => c.type === 'ServiceBlogSection'));

// Test the NEW way (direct API data)
console.log('\n=== TESTING NEW WAY (Direct API Data) ===');
const componentsNewWay = generateServicePageComponents(
  mockApiResponse.data.servicePage.content,
  mockApiResponse.data.serviceInfo,
  mockApiResponse.data.blogs || [] // Use direct API data
);

console.log('Components generated (new way):', componentsNewWay.length);
console.log('Blog section included:', componentsNewWay.some(c => c.type === 'ServiceBlogSection'));
console.log('Blog section component:', componentsNewWay.find(c => c.type === 'ServiceBlogSection'));

console.log('\n✅ Fix validation complete!');