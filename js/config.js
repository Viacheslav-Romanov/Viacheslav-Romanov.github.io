export const resumeSections = [
    { 
        title: "Experience", 
        content: `<h2>Professional Experience</h2>
            <p>Software engineer with more than 15 years 
                experience programming web, desktop and terminal 
                applications on a variety of platforms, 
                operating systems and devices. Has working experience in Singapore,
                UAE, Japan, Russia in a wide variety of sectors and industries.</p>`
    },
    { 
        title: "Education", 
        content: `<h2>Education</h2>
            <p><strong>South Ural State University (SUSU)</strong></p>
            <p>Bachelor's Degree in Computer Science</p>
            <p>2001 - 2007</p>`
    },
    { 
        title: "Certifications", 
        content: `<h2>Professional Certifications</h2>
            <ul>
                <li>AWS Certified Machine Learning – Specialty (Valid until Jan 2024)</li>
                <li>AWS Certified Solutions Architect - Professional (Valid until Dec 2023)</li>
                <li>AWS Certified Solutions Architect – Associate (Valid until Aug 2023)</li>
                <li>AWS Certified DevOps Engineer – Professional</li>
                <li>AWS Certified Developer - Associate</li>
                <li>Kubernetes in the Google Cloud (Qwiklabs)</li>
                <li>Japanese Language Proficiency N4</li>
            </ul>`
    },
    {
        title: "GitHub",
        content: `<h2>GitHub Profile</h2>
            <p>Check out my projects and code repositories!</p>`,
        url: "https://github.com/Viacheslav-Romanov"
    },
    {
        title: "LinkedIn",
        content: `<h2>LinkedIn Profile</h2>
            <p>Connect with me on LinkedIn!</p>`,
        url: "https://www.linkedin.com/in/vyacheslavr"
    },
    {
        title: "Skills",
        content: `<h2>Technical Skills</h2>
            <ul>
                <li>AWS & Cloud Computing</li>
                <li>Machine Learning</li>
                <li>DevOps</li>
                <li>Flutter & Mobile Development</li>
                <li>Kubernetes</li>
                <li>Web Development</li>
                <li>Automated Testing</li>
                <li>Java</li>
                <li>Python</li>
                <li>C#</li>
                <li>C++</li>
                <li>C</li>
                <li>JavaScript</li>
                <li>TypeScript</li>
                <li>SQL</li>
                <li>Kotlin</li>
                <li>Swift</li>
                <li>PHP</li>                        
            </ul>`
    }
];

export const fishPositions = [
    { x: -25, y: -3, z: -20 },  // Experience fish
    { x: 0, y: -5, z: -15 },    // Education fish
    { x: 25, y: -7, z: -20 },   // Certifications fish
    { x: 0, y: -9, z: -25 },    // GitHub fish
    { x: -15, y: -8, z: -30 },  // LinkedIn fish
    { x: 20, y: -6, z: -25 }    // Skills fish
];

export const sceneConfig = {
    backgroundColor: 0x4a87b3,
    fogColor: 0x6699cc,
    fogDensity: 0.004,
    waterLevel: 5,
    groundLevel: -15,
    cameraSettings: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: { x: 0, y: 5, z: 50 },
        minDistance: 10,
        maxDistance: 100,
        maxPolarAngle: Math.PI / 2,
        minPolarAngle: 0
    },
    lighting: {
        ambient: {
            color: 0x8cb3d9,
            intensity: 1.2
        },
        directional: {
            color: 0xffff66,
            intensity: 4.0,
            position: { x: 0, y: 10, z: 0 }
        },
        hemisphere: {
            skyColor: 0xffffcc,
            groundColor: 0x4d88cc,
            intensity: 1.2
        }
    }
};