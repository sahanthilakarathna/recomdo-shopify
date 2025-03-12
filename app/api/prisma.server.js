import prisma from "../db.server";

export const createConfig = async ({ path, value, shop }) => {
  return await prisma.configurations.create({
    data: {
      path: path,
      value: value,
      shop: shop,
    },
  });
};

export const updateConfig = async ({ path, value, config_id }) => {
  return await prisma.configurations.update({
    where: {
      config_id: parseInt(config_id),
      path: path,
    },
    data: {
      value: value,
    },
  });
};

export const updateConfigValue = async ({ path, value }) => {
  return await prisma.configurations.updateMany({
    where: {
      path: path,
    },
    data: {
      value: value,
    },
  });
};

export const getRecomdoConfig = async ({ path }) => {
  return await prisma.configurations.findFirst({
    where: {
      path: path,
    },
  });
};

export const getAllRecomdoConfig = async () => {
  return await prisma.configurations.findMany({
    where: {
      path: {
        startsWith: "gen_",
      },
    },
  });
};

export const getAllFtpConfig = async () => {
  return await prisma.configurations.findMany({
    where: {
      path: {
        startsWith: "ftp",
      },
    },
  });
};

export const getAllProdSyncConfig = async () => {
  return await prisma.configurations.findMany({
    where: {
      path: {
        startsWith: "prodsync",
      },
    },
  });
};

export const getAllCatSyncConfig = async () => {
  return await prisma.configurations.findMany({
    where: {
      path: {
        startsWith: "catsync",
      },
    },
  });
};

export const getAllMarketsRegions = async () => {
  return await prisma.configurations.findMany({
    where: {
      path: {
        startsWith: "market_",
      },
    },
  });
};
export const deleteConfig = async ({ path, config_id }) => {
  return await prisma.configurations.deleteMany({
    where: {
      path: {
        contains: path,
      },
    },
  });
};

export const createCustomer = async ({ email, name }) => {
  return await prisma.customer.create({
    data: {
      id: "12345",
      email: email,
      name: name,
    },
  });
};

export const getSession = async () => {
  return await prisma.session.findFirst();
};

export const getCustomer = async ({ id }) => {
  return await prisma.customer.findFirst({
    where: {
      id: id,
    },
  });
};
