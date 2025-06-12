-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema testschema
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `testschema` ;

-- -----------------------------------------------------
-- Schema testschema
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `testschema` ;
USE `testschema` ;

-- -----------------------------------------------------
-- Table `testschema`.`tournament`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `testschema`.`tournament` ;

CREATE TABLE IF NOT EXISTS `testschema`.`tournament` (
  `tourId` INT(11) NOT NULL,
  `number_of_players` INT NOT NULL DEFAULT 0,
  `round_number` INT NULL,
  `active_players` VARCHAR(45) NULL,
  `non_active_players` VARCHAR(45) NULL,
  PRIMARY KEY (`tourId`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `testschema`.`users`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `testschema`.`users` ;

CREATE TABLE IF NOT EXISTS `testschema`.`users` (
  `id` INT(11) NOT NULL,
  `username` VARCHAR(100) CHARACTER SET 'utf8mb3' NOT NULL,
  `user_password` VARCHAR(100) CHARACTER SET 'utf8mb3' NULL DEFAULT NULL,
  `longest_rally` INT(11) NULL DEFAULT NULL,
  `num_of_loss` INT(11) NULL DEFAULT NULL,
  `num_of_win` INT(11) NULL DEFAULT NULL,
  `tournament_tourId` INT(11) NULL,
  `data_account_made` VARCHAR(45) NULL,
  `date_last_login` VARCHAR(45) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_users_tournament1_idx` (`tournament_tourId` ASC) VISIBLE,
  CONSTRAINT `fk_users_tournament1`
    FOREIGN KEY (`tournament_tourId`)
    REFERENCES `testschema`.`tournament` (`tourId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `testschema`.`game`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `testschema`.`game` ;

CREATE TABLE IF NOT EXISTS `testschema`.`game` (
  `gameId` INT(11) NOT NULL DEFAULT 0,
  `leftId` INT(11) NULL DEFAULT NULL,
  `rightId` INT(11) NULL DEFAULT NULL,
  `tournamentId` INT(11) NOT NULL,
  `leftScore` INT NULL DEFAULT 0,
  `rightScore` INT NULL DEFAULT 0,
  PRIMARY KEY (`gameId`),
  INDEX `fk_game_user_leftId` (`leftId` ASC) VISIBLE,
  INDEX `fk_game_user_rightId` (`rightId` ASC) VISIBLE,
  INDEX `fk_game_tour_id` (`tournamentId` ASC) VISIBLE,
  UNIQUE INDEX `gameId_UNIQUE` (`gameId` ASC) VISIBLE,
  CONSTRAINT `fk_game_tour_id`
    FOREIGN KEY (`tournamentId`)
    REFERENCES `testschema`.`tournament` (`tourId`),
  CONSTRAINT `fk_game_user_leftId`
    FOREIGN KEY (`leftId`)
    REFERENCES `testschema`.`users` (`id`),
  CONSTRAINT `fk_game_user_rightId`
    FOREIGN KEY (`rightId`)
    REFERENCES `testschema`.`users` (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
