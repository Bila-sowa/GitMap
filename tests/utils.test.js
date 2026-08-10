import { createNotification } from '../src/js/utils/utils.js';

const done = (cooldown = 5000) => {
    return new Promise(resolve => setTimeout(resolve, cooldown));
}

export default async function test_001_U() {
    const types = ["info", "success", "warning", "error"];

    for (const type of types) {
        createNotification("Test notification", type);
        await done();
    }
}
