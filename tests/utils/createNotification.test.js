import { createNotification } from '@/js/utils/utils.js';

const done = (cooldown = 5000) => {
    return new Promise(resolve => setTimeout(resolve, cooldown));
}

export default async function test_44ibx_Ui() {
    const types = ["info", "success", "warning", "error"];

    for (const type of types) {
        createNotification("Test notification", type);
        await done();
    }
}
