const license = await prisma.license.create({
  data: {
    type: "Basic",
    price: 50,
    beatId: "beat-id",
  },
});
