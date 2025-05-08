import { JSDOM } from 'jsdom';

const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque augue est, molestie suscipit diam vel, pellentesque lacinia nunc. In hac habitasse platea dictumst. Quisque ac eros mi. Suspendisse ac libero placerat, lobortis dui ut, sagittis nisi. Aliquam ac semper elit, vitae vehicula nibh. Mauris ut tristique massa. Nullam id eleifend ante, a finibus odio. Aenean urna sapien, mollis vel aliquet ac, euismod non orci. Nunc ullamcorper dui et magna imperdiet, in laoreet enim luctus. Aliquam tincidunt risus in sapien vulputate, vitae molestie nulla sagittis. Vivamus congue consequat massa. Nam blandit cursus magna a vestibulum. Aliquam luctus arcu leo, eu tempor sapien tincidunt at. Phasellus tincidunt magna tincidunt libero pharetra lacinia. Mauris tempus ipsum eget felis scelerisque mattis. Ut at rhoncus dolor, sed ultrices tellus. Fusce vel tempus dui. Fusce egestas tristique urna, nec lacinia neque egestas nec. Donec laoreet nunc nibh, eget lacinia purus ornare non. Integer quis ligula et diam porttitor hendrerit. Donec tincidunt ipsum nisi, non fermentum ipsum eleifend id. Phasellus rhoncus quam erat, quis porta orci malesuada ut. Quisque nec pellentesque ligula, sed euismod nunc. Nulla ut eleifend justo. Suspendisse potenti. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc pellentesque, lorem at laoreet pellentesque, ipsum nunc auctor augue, id semper felis elit sit amet risus. Aliquam erat volutpat. Fusce consequat metus nunc, quis suscipit sapien ornare eu. Ut justo augue, vestibulum at tempus vitae, semper sed massa. In quis feugiat velit, et egestas sem. Suspendisse id lectus aliquam, scelerisque nisi et, tristique erat. Curabitur convallis augue id ante pharetra, viverra porttitor enim posuere. Aliquam tortor nunc, gravida non porttitor sit amet, sodales at dolor. Nam viverra lorem id arcu egestas fermentum. Proin purus felis, pharetra sit amet aliquam finibus, dignissim vel urna. ";

let loremIpsumPosition = 0;

export function ReplaceHtmlTextWithLoremIpsum(htmlText:string){
    // Parse HTML into a DOM
    const dom = new JSDOM(htmlText);
    const document = dom.window.document;

    // Function to replace text with equivalent-length Lorem Ipsum
    function replaceTextContent(node: Node) {
        if (node.nodeType === dom.window.Node.TEXT_NODE) {
          const text = node.nodeValue || '';
          const len = text.length;
      
          if (len > 0 && text.trim()) {
            const localLoremIpsum = LOREM_IPSUM.substring(loremIpsumPosition) + LOREM_IPSUM.substring(0, loremIpsumPosition);
            node.nodeValue = localLoremIpsum.substring(0, text.length).trim();
            node.nodeValue = node.nodeValue.charAt(0).toUpperCase() + node.nodeValue.slice(1);
            loremIpsumPosition = (loremIpsumPosition + len) % LOREM_IPSUM.length;
          }
        } else {
          // Recurse through child nodes
          node.childNodes.forEach(replaceTextContent);
        }
    }

    // Start walking from <body> or the document root
    replaceTextContent(document.body);
    
    // Serialize DOM back to HTML
    const modifiedHtml = document.body.innerHTML;
    return modifiedHtml;
}
