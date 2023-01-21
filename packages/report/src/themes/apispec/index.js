import base from "../base";
import Logo from "./catsjs.svg";

const theme = {
  ...base,
  palette: {
    primary: { main: "#4D4861" },
    secondary: { main: "#11cb5f" },
  },
  color: {
    ...base.color,
    green700: "#288f72", //+4
    green500: "#40C9A2",
    green200: "#a0e4d1", //-6
    green100: "#bfede0", //-8
    red700: "#ef1a2c", //+4
    red500: "#F45B69",
    red100: "#fcd9dc", //-6
  },
  Logo,
};

export default theme;

/*
brand   51344D | 4F2D76 | 452768 | 3B2259 | 311C4A | 4D4861
success 70EE9C | 40C9A2 | 21FA90 | 0C7C59 | 51CB20 | 226F54
error   F45B69 | DB162F | BB342F | D64933 | E03616 | DA2C38

brand   
success 
error   

brand   
success 
error   
*/

/*
brand
#2E2D4D
#3D2645
#1C3144


success
#50A14F atom one
#337357
#a6e22e monokai

error
#E45649 atom one
#f92672 monokai

info
#4078f2 atom one
#3891A6
#2176AE
#66d9ef monokai

warn
#c18401 atom one
#FFBC42
#e6db74 monokai

*/
