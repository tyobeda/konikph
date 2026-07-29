const fs = require('fs');

const extraSchema = `
model Notification {
  id          String   @id @default(uuid())
  type        String   
  title       String
  description String
  isRead      Boolean  @default(false)
  iconColor   String?
  bgColor     String?
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model TwibbonFrame {
  id        String   @id @default(uuid())
  title     String
  imageUrl  String
  category  String
  region    String
  usedCount Int      @default(0)
  status    String   @default("Pending")
  isFeatured Boolean @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model DpwOffice {
  id             String   @id @default(uuid())
  name           String
  code           String   @unique
  coordinator    String
  phone          String
  email          String
  address        String
  activeCreators Int      @default(0)
  totalArtworks  Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
`;

fs.appendFileSync('prisma/schema.prisma', extraSchema);
console.log('Appended schema successfully.');
