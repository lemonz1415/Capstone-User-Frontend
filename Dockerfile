# ใช้ Node.js เป็น base image
FROM node:18-alpine

# ตั้งค่า working directory
WORKDIR /app

# คัดลอกไฟล์ package.json และ package-lock.json (หรือ yarn.lock) ไปยัง container
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมดไปยัง container
COPY . .

# Build แอป (ถ้าใช้ Next.js หรือ React)
RUN npm run build

# ระบุพอร์ตที่ container จะใช้งาน
EXPOSE 4000

# รันแอป
CMD ["npm", "start"]
