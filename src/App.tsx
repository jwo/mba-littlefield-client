import {
  ChevronLeft,
  ChevronRight,
  ListAltOutlined,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  Card,
  CardContent,
  DialogContent,
  Dialog,
} from "@mui/material";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import RawTrend from "react-trend";

const queryClient = new QueryClient();

export interface Data {
  day: number;
  cash: number;
  INVORDER: string;
  Name: string;
  "unit Cost": string;
  "order Cost": string;
  "lead Time": string;
  "reorder Point": string;
  JOBIN: Array<number>;
  INV: Array<number>;
  S1Q: Array<number>;
  S1UTIL: Array<number>;
  S2Q: Array<number>;
  S2UTIL: Array<number>;
  S3Q: Array<number>;
  S3UTIL: Array<number>;
  JOBOUT: Array<number>;
  JOBT: Array<number>;
  JOBREV: Array<number>;
}

const Example: React.FC = () => {
  const [day, setDay] = useState<number>(0);
  const [trendsSince, setTrendsSince] = useState<number>(50);
  const [popupData, handlePopup] = useState<Array<number> | undefined>();

  const { isLoading, error, data } = useQuery("repoData", () =>
    fetch(process.env.REACT_APP_URL || "").then(
      (res) => res.json() as Promise<Data>
    )
  );
  useEffect(() => {
    if (data) {
      setDay(data.day);
    }
  }, [data]);

  if (isLoading)
    return (
      <Card>
        <CardContent>
          <LinearProgress />
          <Typography>Loading the dumpster</Typography>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Typography>An error has occurred: {(error as Error).message}</Typography>
    );

  if (!data) return null;

  const possibleTrendsSince = Array.from(new Array(day));

  const dataForDay = (attribute: keyof typeof data, day: number) => {
    return Math.round((data[attribute] as Array<number>)[day - 1]);
  };

  const systemTrendForDay = (i: number) => {
    return (
      dataForDay("JOBIN", i) +
      dataForDay("S1Q", i) +
      dataForDay("S2Q", i) +
      dataForDay("S3Q", i)
    );
  };
  const totalSystemTrend = Array.from(new Array(data.day)).map((e, i) => {
    return systemTrendForDay(i);
  });

  const dayRevenue = (i: number) => {
    return dataForDay("JOBOUT", i) * dataForDay("JOBREV", i);
  };

  const revenueTrend = possibleTrendsSince.map((e, i) => {
    return dayRevenue(i + 1);
  });

  const Trend: React.FC<{ data: Array<number> }> = ({ data }) => {
    const d = data.map((r) => {
      if (Number.isNaN(r)) return 0;
      return Number(r);
    });

    return <RawTrend data={d} />;
  };

  console.log({ data });
  return (
    <Box style={{ maxWidth: 600, margin: "0 auto" }}>
      <Dialog open={Boolean(popupData)} onClose={() => handlePopup(undefined)}>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(popupData || []).map((v, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 2 + trendsSince}</TableCell>
                  <TableCell>{v}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      <Typography variant="h3">
        Day {day}. Cash: {data.cash}
      </Typography>

      <Box display="flex" justifyContent="space-between">
        <div style={{ flex: 1 }}>
          <IconButton disabled={day === 1} onClick={() => setDay((x) => x - 1)}>
            <ChevronLeft />
          </IconButton>
          <IconButton
            disabled={day >= data.day}
            onClick={() => setDay((x) => x + 1)}
          >
            <ChevronRight />
          </IconButton>
        </div>

        <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
          <InputLabel>Trend After Day</InputLabel>
          <Select
            label={"Trends Days"}
            value={trendsSince}
            onChange={(e) => setTrendsSince(Number(e.target.value))}
          >
            {possibleTrendsSince.map((e, i) => (
              <MenuItem value={i} key={i}>
                {i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Day {day}</TableCell>
              <TableCell>Day {day - 1}</TableCell>
              <TableCell>Trend since Day {trendsSince}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Total in system (Job IN and queues)</TableCell>
              <TableCell>{systemTrendForDay(day)}</TableCell>
              <TableCell>{systemTrendForDay(day - 1)}</TableCell>

              <TableCell>
                <Trend data={totalSystemTrend} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handlePopup(totalSystemTrend)}>
                  <ListAltOutlined />
                </IconButton>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Day Revenue</TableCell>
              <TableCell>{dayRevenue(day)}</TableCell>
              <TableCell>{dayRevenue(day - 1)}</TableCell>
              <TableCell>
                <Trend data={revenueTrend} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handlePopup(revenueTrend)}>
                  <ListAltOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Day Leadtime</TableCell>
              <TableCell>{dataForDay("JOBT", day)}</TableCell>
              <TableCell>{dataForDay("JOBT", day - 1)}</TableCell>
              <TableCell>
                <Trend data={data.JOBT} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handlePopup(data.JOBT)}>
                  <ListAltOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>In INV</TableCell>
              <TableCell>{dataForDay("INV", day)}</TableCell>
              <TableCell>{dataForDay("INV", day - 1)}</TableCell>
              <TableCell>
                <Trend data={data.INV} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handlePopup(data.INV)}>
                  <ListAltOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jobs Completed</TableCell>
              <TableCell>{dataForDay("JOBOUT", day)}</TableCell>
              <TableCell>{dataForDay("JOBOUT", day - 1)}</TableCell>
              <TableCell>
                <Trend data={data.JOBOUT} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handlePopup(data.JOBOUT)}>
                  <ListAltOutlined />
                </IconButton>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>
                <Divider />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Next INV:</TableCell>
              <TableCell colSpan={3}>{data.INVORDER}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={3}>
                <Divider />
              </TableCell>
            </TableRow>
            {Object.entries(data)
              .filter(([k, v]) => Array.isArray(v))
              .map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell>{k}</TableCell>
                  <TableCell>{dataForDay(k as keyof Data, day)}</TableCell>
                  <TableCell>{dataForDay(k as keyof Data, day - 1)}</TableCell>
                  <TableCell>
                    <Trend
                      data={(v as Array<number>).filter(
                        (e, i) => i > trendsSince
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handlePopup(v as Array<number>)}>
                      <ListAltOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Example />
    </QueryClientProvider>
  );
}
