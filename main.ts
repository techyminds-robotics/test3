/*
Copyright (C): 2010-2019, Shenzhen Yahboom Tech
modified from liusen
load dependency
"techybricksV2": "file:../pxt-techybricksV21"
*/

//% color="#ECA40D" weight=30 icon="\uf135"
namespace techybricksV2 {

    const PCA9685_ADD = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04

    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09

    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD

    const PRESCALE = 0xFE

    const STP_CHA_L = 2047
    const STP_CHA_H = 4095

    const STP_CHB_L = 1
    const STP_CHB_H = 2047

    const STP_CHC_L = 1023
    const STP_CHC_H = 3071

    const STP_CHD_L = 3071
    const STP_CHD_H = 1023

    let initialized = false
    let yahStrip: neopixel.Strip;

    
    export enum enMusic {

        dadadum = 0,
        entertainer,
        prelude,
        ode,
        nyan,
        ringtone,
        funk,
        blues,

        birthday,
        wedding,
        funereal,
        punchline,
        baddy,
        chase,
        ba_ding,
        wawawawaa,
        jump_up,
        jump_down,
        power_up,
        power_down
    }
    
    
    export enum enSteppers {
        B1 = 0x1,
        B2 = 0x2
    }
    export enum enPos {
        //% blockId="forward" block="forward"
        forward = 1,
        //% blockId="reverse" block="reverse"
        reverse = 2,
        //% blockId="stop" block="stop"
        stop = 3
    }

    export enum enTurns {
        //% blockId="T1B4" block="1/4"
        T1B4 = 90,
        //% blockId="T1B2" block="1/2"
        T1B2 = 180,
        //% blockId="T1B0" block="1"
        T1B0 = 360,
        //% blockId="T2B0" block="2"
        T2B0 = 720,
        //% blockId="T3B0" block="3"
        T3B0 = 1080,
        //% blockId="T4B0" block="4"
        T4B0 = 1440,
        //% blockId="T5B0" block="5"
        T5B0 = 1800
    }
    
    export enum enServo {
        
        S1 = 0,
        S2,
        S3,
        S4,
        S5,
        S6,
        S7,
        S8
    }
    export enum enMotors {
        M1 = 8,
        M2 = 10,
        M3 = 12,
        M4 = 14
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cwrite(PCA9685_ADD, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval; //Math.Floor(prescaleval + 0.5);
        let oldmode = i2cread(PCA9685_ADD, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cwrite(PCA9685_ADD, MODE1, newmode); // go to sleep
        i2cwrite(PCA9685_ADD, PRESCALE, prescale); // set the prescaler
        i2cwrite(PCA9685_ADD, MODE1, oldmode);
        control.waitMicros(5000);
        i2cwrite(PCA9685_ADD, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;
        if (!initialized) {
            initPCA9685();
        }
        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADD, buf);
    }

    function setStepper(index: number, dir: boolean): void {
        if (index == enSteppers.B1) {
            if (dir) {
                setPwm(11, STP_CHA_L, STP_CHA_H);
                setPwm(9, STP_CHB_L, STP_CHB_H);
                setPwm(10, STP_CHC_L, STP_CHC_H);
                setPwm(8, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(8, STP_CHA_L, STP_CHA_H);
                setPwm(10, STP_CHB_L, STP_CHB_H);
                setPwm(9, STP_CHC_L, STP_CHC_H);
                setPwm(11, STP_CHD_L, STP_CHD_H);
            }
        } else {
            if (dir) {
                setPwm(12, STP_CHA_L, STP_CHA_H);
                setPwm(14, STP_CHB_L, STP_CHB_H);
                setPwm(13, STP_CHC_L, STP_CHC_H);
                setPwm(15, STP_CHD_L, STP_CHD_H);
            } else {
                setPwm(15, STP_CHA_L, STP_CHA_H);
                setPwm(13, STP_CHB_L, STP_CHB_H);
                setPwm(14, STP_CHC_L, STP_CHC_H);
                setPwm(12, STP_CHD_L, STP_CHD_H);
            }
        }
    }

    function stopMotor(index: number) {
        setPwm(index, 0, 0);
        setPwm(index + 1
