import { AptosAPI } from "../../network";
import { getBalances } from "../../logic/getBalances";
import { APTOS_ASSET_ID } from "../../constants";
import BigNumber from "bignumber.js";

jest.mock("../../network");
let mockedAptosApi: jest.Mocked<any>;

describe("getBalance", () => {
  // let mockGetBalances: jest.Mock;

  beforeEach(() => {
    mockedAptosApi = jest.mocked(AptosAPI);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should returns balance with value 10", async () => {
    // mockGetBalances.mockResolvedValue([{ contracAddress: APTOS_ASSET_ID, amount: new BigNumber(10) }]);

    const mockGetBalances = jest
      .fn()
      .mockResolvedValue([{ contractAddress: APTOS_ASSET_ID, amount: BigNumber(10) }]);
    mockedAptosApi.mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const accountAddress = "0x4be47904b31063d60ac0dfde06e5dc203e647edbe853bae0e666ae5a763c3906";
    const client = new AptosAPI("aptos");
    const balances = await getBalances(client, accountAddress);

    expect(balances).toBeDefined();
    expect(balances).toMatchObject([{ value: BigInt(10), asset: { type: "native" } }]);
    expect(mockGetBalances).toHaveBeenCalledWith(accountAddress, undefined);
  });

  it("should return empty array when no contract_address and no data", async () => {
    const mockGetBalances = jest.fn().mockResolvedValue([]);
    mockedAptosApi.mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const accountAddress = "0xno_contract_and_no_data";
    const client = new AptosAPI("aptos");
    const balances = await getBalances(client, accountAddress);

    expect(balances).toEqual([]);
    expect(mockGetBalances).toHaveBeenCalledWith(accountAddress, undefined);
  });

  it("should return balance with 'native' contract_address (APTOS_ASSET_ID)", async () => {
    const mockGetBalances = jest
      .fn()
      .mockResolvedValue([{ contractAddress: APTOS_ASSET_ID, amount: new BigNumber(15) }]);
    mockedAptosApi.mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const accountAddress = "0xcontract_present";
    const contractAddress = APTOS_ASSET_ID;
    const client = new AptosAPI("aptos");
    const balance = await getBalances(client, accountAddress, contractAddress);

    expect(balance).toBeDefined();
    expect(balance).toMatchObject([{ value: BigInt(15), asset: { type: "native" } }]);
    expect(mockGetBalances).toHaveBeenCalledWith(accountAddress, contractAddress);
  });

  it("should return token balance when contract_address is a coin token", async () => {
    const TOKEN_ASSET_ID = "0x1::my_token::Token";
    const mockGetBalances = jest
      .fn()
      .mockResolvedValue([{ contractAddress: TOKEN_ASSET_ID, amount: new BigNumber(25) }]);
    mockedAptosApi.mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const accountAddress = "0xtoken_holder";
    const contractAddress = TOKEN_ASSET_ID;
    const client = new AptosAPI("aptos");

    const balance = await getBalances(client, accountAddress, contractAddress);

    expect(balance).toBeDefined();
    expect(balance).toMatchObject([
      {
        value: BigInt(25),
        asset: { type: "token", contractAddress: TOKEN_ASSET_ID, standard: "coin" },
      },
    ]);
    expect(mockGetBalances).toHaveBeenCalledWith(accountAddress, contractAddress);
  });

  it("should return token balance when contract_address is a fungible_asset token", async () => {
    const TOKEN_ASSET_ID = "0x1";
    const mockGetBalances = jest
      .fn()
      .mockResolvedValue([{ contractAddress: TOKEN_ASSET_ID, amount: new BigNumber(25) }]);
    mockedAptosApi.mockImplementation(() => ({
      getBalances: mockGetBalances,
    }));

    const accountAddress = "0xtoken_holder";
    const contractAddress = TOKEN_ASSET_ID;
    const client = new AptosAPI("aptos");

    const balance = await getBalances(client, accountAddress, contractAddress);

    expect(balance).toBeDefined();
    expect(balance).toMatchObject([
      {
        value: BigInt(25),
        asset: { type: "token", contractAddress: TOKEN_ASSET_ID, standard: "fungible_asset" },
      },
    ]);
    expect(mockGetBalances).toHaveBeenCalledWith(accountAddress, contractAddress);
  });
});
