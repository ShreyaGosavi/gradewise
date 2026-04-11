/*
  Warnings:

  - You are about to drop the column `name` on the `Class` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year,department,division]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `division` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Year" AS ENUM ('FE', 'SE', 'TE', 'BE');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('CSE', 'IT', 'ME', 'CIVIL', 'EXTC');

-- DropIndex
DROP INDEX "Class_name_key";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "name",
ADD COLUMN     "department" "Department" NOT NULL,
ADD COLUMN     "division" TEXT NOT NULL,
ADD COLUMN     "year" "Year" NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "department" "Department" NOT NULL,
ADD COLUMN     "year" "Year" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Class_year_department_division_key" ON "Class"("year", "department", "division");
