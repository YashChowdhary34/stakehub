import client from "@/lib/prisma";

async function main() {
  const exists = await client.setting.findFirst();
  if (!exists) {
    await client.setting.create({
      data: {
        estimatedReplyTime: 0.3,
      },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => client.$disconnect());
