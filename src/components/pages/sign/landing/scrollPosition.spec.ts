import { computeScrollTop } from './scrollPosition';

describe('computeScrollTop', () => {
  it('leva o topo do elemento até o respiro acima dele', () => {
    expect(
      computeScrollTop({
        elementTop: 900,
        containerTop: 0,
        currentScrollTop: 0,
        maxScrollTop: 2000,
        breathingRoom: 16,
      }),
    ).toBe(884);
  });

  it('considera a rolagem atual e o topo do contêiner', () => {
    expect(
      computeScrollTop({
        elementTop: 300,
        containerTop: 50,
        currentScrollTop: 400,
        maxScrollTop: 2000,
        breathingRoom: 16,
      }),
    ).toBe(634);
  });

  it('não passa do fim da página', () => {
    expect(
      computeScrollTop({
        elementTop: 900,
        containerTop: 0,
        currentScrollTop: 0,
        maxScrollTop: 500,
      }),
    ).toBe(500);
  });

  it('não vai abaixo de zero', () => {
    expect(
      computeScrollTop({
        elementTop: 4,
        containerTop: 0,
        currentScrollTop: 0,
        maxScrollTop: 500,
      }),
    ).toBe(0);
  });
});
