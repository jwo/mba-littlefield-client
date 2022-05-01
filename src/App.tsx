import { ChevronLeft, ChevronRight } from "@mui/icons-material";
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
} from "@mui/material";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import Trend from "react-trend";

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

  const { isLoading, error, data } = useQuery("repoData", () =>
    fetch("https://littfield-team7-dumpster.herokuapp.com/api/status").then(
      (res) => res.json() as Promise<Data>
    )
  );
  useEffect(() => {
    if (data) {
      setDay(data.day - 1);
    }
  }, [data]);

  if (isLoading) return <LinearProgress />;

  if (error)
    return (
      <Typography>An error has occurred: {(error as Error).message}</Typography>
    );

  if (!data) return null;

  const possibleTrendsSince = Array.from(new Array(day));

  console.log({ data });
  return (
    <Box style={{ maxWidth: 600, margin: "0 auto" }}>
      <Typography variant="h3">
        Day {day}. Cash: {data.cash}
      </Typography>

      <Box display="flex" justifyContent="space-between">
        <div style={{ flex: 1 }}>
          <IconButton disabled={day === 1} onClick={() => setDay((x) => x - 1)}>
            <ChevronLeft />
          </IconButton>
          <IconButton
            disabled={day === data.day - 1}
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
              <TableCell>Value</TableCell>
              <TableCell>Day Before</TableCell>
              <TableCell>Trend since Day {trendsSince}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Total in system (Job IN and queues)</TableCell>
              <TableCell>
                {Math.floor(
                  data.JOBIN[day] +
                    data.S1Q[day] +
                    data.S2Q[day] +
                    data.S3Q[day]
                )}
              </TableCell>
              <TableCell>
                {Math.round(
                  data.JOBIN[day - 1] +
                    data.S1Q[day - 1] +
                    data.S2Q[day - 1] +
                    data.S3Q[day - 1]
                )}
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Day Revenue</TableCell>
              <TableCell>
                {Number(data.JOBOUT[day]) * Number(data.JOBREV[day])}
              </TableCell>
              <TableCell>
                {Number(data.JOBOUT[day - 1]) * Number(data.JOBREV[day - 1])}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Day Leadtime</TableCell>
              <TableCell>{data.JOBT[day]}</TableCell>
              <TableCell>{data.JOBT[day - 1]}</TableCell>
              <TableCell>
                <Trend data={data.JOBT.filter((e, i) => i > trendsSince)} />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>In INV</TableCell>
              <TableCell>{data.INV[day]}</TableCell>
              <TableCell>{data.INV[day - 1]}</TableCell>
              <TableCell>
                <Trend data={data.INV.filter((e, i) => i > trendsSince)} />
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Jobs Completed</TableCell>
              <TableCell>{data.JOBOUT[day]}</TableCell>
              <TableCell>{data.JOBOUT[day - 1]}</TableCell>
              <TableCell>
                <Trend data={data.JOBOUT.filter((e, i) => i > trendsSince)} />
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
                  <TableCell>{v[day]}</TableCell>
                  <TableCell>{v[day - 1]}</TableCell>
                  <TableCell>
                    <Trend
                      data={(v as Array<number>).filter(
                        (e, i) => i > trendsSince
                      )}
                    />
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
