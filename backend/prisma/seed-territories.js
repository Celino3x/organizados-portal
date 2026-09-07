const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dados extraídos dos seus arquivos
const territories = [
  { number: 1, name: "Condomínio Aripuãna", group: "Vilar Guanabara", type: "condominium", address: "Condomínio Aripuãna", latitude: -43.6165355, longitude: -22.9147943, status: "available" },
  { number: 2, name: "Serra do Cipó/Alfredo de Assunção", group: "Vilar Guanabara", type: "residential", address: "Serra do Cipó, Alfredo de Assunção", latitude: -43.6162726, longitude: -22.9139296, status: "available" },
  { number: 3, name: "Serra do Cipó/Florentino Ávidos", group: "Vilar Guanabara", type: "residential", address: "Serra do Cipó, Florentino Ávidos", latitude: -43.6140053, longitude: -22.913466, status: "available" },
  { number: 4, name: "Serra do Cipó", group: "Vilar Guanabara", type: "residential", address: "Serra do Cipó", latitude: -43.6139289, longitude: -22.9140071, status: "available" },
  { number: 5, name: "Praça do Externato", group: "Vilar Guanabara", type: "mixed", address: "Praça do Externato", latitude: -43.6124067, longitude: -22.9133697, status: "available" },
  { number: 6, name: "Bom Pastor/Arco Íris", group: "Vilar Guanabara", type: "residential", address: "Bom Pastor/Arco Íris", latitude: -43.6113754, longitude: -22.9133771, status: "available" },
  { number: 7, name: "Território 7", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6140124, longitude: -22.9148588, status: "available" },
  { number: 8, name: "Território 8", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6139855, longitude: -22.9141028, status: "available" },
  { number: 9, name: "Território 9", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6132399, longitude: -22.9148637, status: "available" },
  { number: 10, name: "Território 10", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.612524, longitude: -22.9148145, status: "available" },
  { number: 11, name: "Território 11", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6117301, longitude: -22.914938, status: "available" },
  { number: 12, name: "Território 12", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.610937, longitude: -22.9149205, status: "available" },
  { number: 13, name: "Território 13", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6095306, longitude: -22.9148886, status: "available" },
  { number: 14, name: "Território 14", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6108717, longitude: -22.9141622, status: "available" },
  { number: 15, name: "Território 15", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6108297, longitude: -22.9134728, status: "available" },
  { number: 16, name: "Território 16", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6094859, longitude: -22.9134624, status: "available" },
  { number: 17, name: "Território 17", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6100295, longitude: -22.9135594, status: "available" },
  { number: 18, name: "Território 18", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.610642, longitude: -22.9134827, status: "available" },
  { number: 19, name: "Território 19", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6102387, longitude: -22.9126898, status: "available" },
  { number: 20, name: "Território 20", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6094824, longitude: -22.912759, status: "available" },
  { number: 21, name: "Território 21", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6088744, longitude: -22.9117949, status: "available" },
  { number: 22, name: "Território 22", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6086785, longitude: -22.9142314, status: "available" },
  { number: 23, name: "Território 23", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6078363, longitude: -22.9142205, status: "available" },
  { number: 24, name: "Território 24", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6086831, longitude: -22.9138608, status: "available" },
  { number: 25, name: "Território 25", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6071496, longitude: -22.9127271, status: "available" },
  { number: 26, name: "Território 26", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6078443, longitude: -22.9135432, status: "available" },
  { number: 27, name: "Território 27", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6087421, longitude: -22.9131938, status: "available" },
  { number: 28, name: "Território 28", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6082869, longitude: -22.9127541, status: "available" },
  { number: 29, name: "Território 29", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6080562, longitude: -22.9124088, status: "available" },
  { number: 30, name: "Território 30", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6071577, longitude: -22.9119107, status: "available" },
  { number: 31, name: "Território 31", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6079911, longitude: -22.9117912, status: "available" },
  { number: 32, name: "Território 32", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6065073, longitude: -22.9123328, status: "available" },
  { number: 33, name: "Território 33", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6056329, longitude: -22.9111562, status: "available" },
  { number: 34, name: "Território 34", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6055276, longitude: -22.9126811, status: "available" },
  { number: 35, name: "Território 35", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6065391, longitude: -22.912557, status: "available" },
  { number: 36, name: "Território 36", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6066411, longitude: -22.9130759, status: "available" },
  { number: 37, name: "Território 37", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6068323, longitude: -22.9138862, status: "available" },
  { number: 38, name: "Território 38", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6058718, longitude: -22.9149548, status: "available" },
  { number: 39, name: "Território 39", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6045425, longitude: -22.9144854, status: "available" },
  { number: 40, name: "Território 40", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6033854, longitude: -22.9141914, status: "available" },
  { number: 41, name: "Território 41", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6023612, longitude: -22.9137568, status: "available" },
  { number: 42, name: "Território 42", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6032303, longitude: -22.9135739, status: "available" },
  { number: 43, name: "Território 43", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6037931, longitude: -22.9128474, status: "available" },
  { number: 44, name: "Território 44", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6047774, longitude: -22.9126769, status: "available" },
  { number: 45, name: "Território 45", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6037475, longitude: -22.9124793, status: "available" },
  { number: 46, name: "Território 46", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6029868, longitude: -22.9111232, status: "available" },
  { number: 47, name: "Território 47", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6022238, longitude: -22.9122758, status: "available" },
  { number: 48, name: "Território 48", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6022432, longitude: -22.9137717, status: "available" },
  { number: 49, name: "Território 49", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6015619, longitude: -22.9136136, status: "available" },
  { number: 50, name: "Território 50", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6014045, longitude: -22.9139776, status: "available" },
  { number: 51, name: "Território 51", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6014218, longitude: -22.9136322, status: "available" },
  { number: 52, name: "Território 52", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6008773, longitude: -22.9136272, status: "available" },
  { number: 53, name: "Território 53", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6007975, longitude: -22.9140064, status: "available" },
  { number: 54, name: "Território 54", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.601867, longitude: -22.9104624, status: "available" },
  { number: 55, name: "Território 55", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6014305, longitude: -22.9119756, status: "available" },
  { number: 56, name: "Território 56", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6010979, longitude: -22.9120101, status: "available" },
  { number: 57, name: "Território 57", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6009752, longitude: -22.9125917, status: "available" },
  { number: 58, name: "Território 58", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6000787, longitude: -22.9123511, status: "available" },
  { number: 59, name: "Território 59", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.6000209, longitude: -22.9139859, status: "available" },
  { number: 60, name: "Território 60", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.5991921, longitude: -22.913892, status: "available" },
  { number: 61, name: "Território 61", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.5997668, longitude: -22.9122825, status: "available" },
  { number: 62, name: "Território 62", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.5995959, longitude: -22.911941, status: "available" },
  { number: 63, name: "Território 63", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.5991606, longitude: -22.9118497, status: "available" },
  { number: 64, name: "Território 64", group: "Vilar Guanabara", type: "residential", address: "Vilar Guanabara", latitude: -43.5976455, longitude: -22.9136612, status: "available" }
];

async function main() {
  console.log('🌱 Iniciando seed dos territórios...');
  
  for (const territory of territories) {
    try {
      await prisma.territory.upsert({
        where: { number: territory.number },
        update: territory,
        create: territory
      });
      console.log(`✅ Território ${territory.number} criado/atualizado`);
    } catch (error) {
      console.error(`❌ Erro no território ${territory.number}:`, error.message);
    }
  }
  
  console.log(`✅ ${territories.length} territórios processados!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });