export const generateGroupSlug = (name) => {
    const time = Date.now();
    name = name.toLowerCase();
    let slug = "";
    for (let ch of name) {
        // console.log (ch);
        if (ch >= 'a' && ch <= 'z') {
            slug += ch;
        }
    }
    
    return slug+time;
} 